import tls from 'tls';
import net from 'net';

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure?: boolean;
}

export interface SendMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends an email over SMTP with zero external dependencies using Node.js native TLS.
 * Fully supports smtp.gmail.com:465 with Google App Passwords and standard SMTPS.
 */
export async function sendSmtpMail(
  config: SmtpConfig,
  mail: SendMailOptions
): Promise<{ success: boolean; messageId?: string }> {
  const { host, port, user, pass } = config;
  const { from, to, subject, html, text } = mail;

  return new Promise((resolve, reject) => {
    const isDirectTls = port === 465 || config.secure === true;

    let socket: tls.TLSSocket | net.Socket;
    let buffer = '';
    let step = 0;
    let settled = false;

    const cleanup = (err?: Error) => {
      if (settled) return;
      settled = true;
      try {
        socket.destroy();
      } catch {
        // Ignore destroy error
      }
      if (err) {
        reject(err);
      }
    };

    try {
      socket = tls.connect(port, host, { minVersion: 'TLSv1.2' });
    } catch (err: any) {
      return reject(new Error(`Failed to initiate TLS connection to ${host}:${port}: ${err.message}`));
    }

    socket.setTimeout(15000, () => {
      cleanup(new Error(`SMTP connection timed out after 15 seconds connecting to ${host}:${port}`));
    });

    socket.setEncoding('utf8');

    function sendCommand(cmd: string) {
      socket.write(cmd + '\r\n');
    }

    socket.on('data', (chunk: string) => {
      buffer += chunk;
      // Check for complete SMTP response (e.g. "250 ...\r\n" where last line has code + space)
      const lines = buffer.split('\r\n');
      if (lines.length <= 1) return;

      const lastLine = lines[lines.length - 2];
      if (!/^\d{3}\s/.test(lastLine)) {
        return; // Multiline response still in progress
      }

      buffer = '';
      const code = parseInt(lastLine.substring(0, 3), 10);

      try {
        if (step === 0) {
          // 0. Greeting: Server responds 220
          if (code !== 220) throw new Error(`SMTP Greeting failed: ${lastLine}`);
          step = 1;
          sendCommand('EHLO localhost');
        } else if (step === 1) {
          // 1. EHLO response: 250
          if (code !== 250) throw new Error(`SMTP EHLO failed: ${lastLine}`);
          step = 2;
          sendCommand('AUTH LOGIN');
        } else if (step === 2) {
          // 2. AUTH LOGIN prompt: 334 (Username challenge)
          if (code !== 334) throw new Error(`SMTP AUTH LOGIN rejected: ${lastLine}`);
          step = 3;
          sendCommand(Buffer.from(user).toString('base64'));
        } else if (step === 3) {
          // 3. Password prompt: 334
          if (code !== 334) throw new Error(`SMTP Username rejected: ${lastLine}`);
          step = 4;
          // Strip any spaces from app password if present
          const cleanPass = pass.replace(/\s+/g, '');
          sendCommand(Buffer.from(cleanPass).toString('base64'));
        } else if (step === 4) {
          // 4. Auth result: 235
          if (code !== 235) {
            throw new Error(
              `SMTP Authentication failed (${lastLine}). For Gmail, make sure you use a 16-character Google App Password (not your normal Google account password).`
            );
          }
          step = 5;
          const cleanFrom = from.includes('<') ? from.match(/<([^>]+)>/)?.[1] || from : from;
          sendCommand(`MAIL FROM:<${cleanFrom}>`);
        } else if (step === 5) {
          // 5. MAIL FROM response: 250
          if (code !== 250) throw new Error(`SMTP MAIL FROM failed: ${lastLine}`);
          step = 6;
          const cleanTo = to.includes('<') ? to.match(/<([^>]+)>/)?.[1] || to : to;
          sendCommand(`RCPT TO:<${cleanTo}>`);
        } else if (step === 6) {
          // 6. RCPT TO response: 250
          if (code !== 250) throw new Error(`SMTP RCPT TO failed (${lastLine}). Could not deliver to ${to}`);
          step = 7;
          sendCommand('DATA');
        } else if (step === 7) {
          // 7. DATA prompt: 354
          if (code !== 354) throw new Error(`SMTP DATA rejected: ${lastLine}`);
          step = 8;

          const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;
          const rawMessage = [
            `From: ${from}`,
            `To: ${to}`,
            `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
            `MIME-Version: 1.0`,
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            ``,
            `--${boundary}`,
            `Content-Type: text/plain; charset=UTF-8`,
            `Content-Transfer-Encoding: base64`,
            ``,
            Buffer.from(text || subject).toString('base64'),
            ``,
            `--${boundary}`,
            `Content-Type: text/html; charset=UTF-8`,
            `Content-Transfer-Encoding: base64`,
            ``,
            Buffer.from(html).toString('base64'),
            ``,
            `--${boundary}--`,
            `.`,
          ].join('\r\n');

          socket.write(rawMessage + '\r\n');
        } else if (step === 8) {
          // 8. Message accepted: 250
          if (code !== 250) throw new Error(`SMTP Message transfer failed: ${lastLine}`);
          step = 9;
          sendCommand('QUIT');
        } else if (step === 9) {
          // 9. QUIT acknowledged: 221
          settled = true;
          socket.end();
          resolve({ success: true, messageId: lastLine });
        }
      } catch (err: any) {
        cleanup(err);
      }
    });

    socket.on('error', (err: Error) => {
      cleanup(err);
    });

    socket.on('close', () => {
      if (!settled) {
        cleanup(new Error('SMTP socket closed unexpectedly before completion.'));
      }
    });
  });
}
