/**
 * Unified Email Service
 * Consolidates WFC, DKL, and SendGrid email providers with automatic fallback
 */

export interface EmailOptions {
    to: string
    subject: string
    html: string
    from?: string
    replyTo?: string
}

export interface EmailResult {
    success: boolean
    provider: string
    messageId?: string
    error?: string
}

interface EmailProvider {
    name: string
    send(options: EmailOptions): Promise<EmailResult>
}

/**
 * WFC (Whisky For Charity) Email Service Provider
 */
class WFCEmailProvider implements EmailProvider {
    name = 'WFC'

    async send(options: EmailOptions): Promise<EmailResult> {
        const backendUrl = process.env.WFC_BACKEND_URL
        const apiKey = process.env.WFC_API_KEY

        if (!backendUrl || !apiKey) {
            throw new Error('WFC Email Service not configured')
        }

        try {
            const response = await fetch(`${backendUrl}/api/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey,
                },
                body: JSON.stringify(options),
                signal: AbortSignal.timeout(10000), // 10s timeout
            })

            if (!response.ok) {
                throw new Error(`WFC API error: ${response.status}`)
            }

            const data = await response.json()
            return {
                success: true,
                provider: this.name,
                messageId: data.messageId,
            }
        } catch (error) {
            return {
                success: false,
                provider: this.name,
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }
}

/**
 * SendGrid Email Provider (Fallback)
 */
class SendGridEmailProvider implements EmailProvider {
    name = 'SendGrid'

    async send(options: EmailOptions): Promise<EmailResult> {
        const sgMail = await import('@sendgrid/mail')
        const apiKey = process.env.SENDGRID_API_KEY

        if (!apiKey) {
            throw new Error('SendGrid not configured')
        }

        try {
            sgMail.default.setApiKey(apiKey)

            const [response] = await sgMail.default.send({
                to: options.to,
                from: options.from || process.env.WFC_ADMIN_EMAIL || 'noreply@whiskyforcharity.com',
                subject: options.subject,
                html: options.html,
                replyTo: options.replyTo,
            })

            return {
                success: true,
                provider: this.name,
                messageId: response.headers['x-message-id'],
            }
        } catch (error) {
            return {
                success: false,
                provider: this.name,
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }
}

/**
 * Unified Email Service with automatic fallback
 */
export class EmailService {
    private providers: EmailProvider[]

    constructor() {
        this.providers = [
            new WFCEmailProvider(),
            new SendGridEmailProvider(),
        ]
    }

    /**
     * Send email with automatic fallback to next provider on failure
     */
    async send(options: EmailOptions): Promise<EmailResult> {
        const errors: string[] = []

        for (const provider of this.providers) {
            try {
                const result = await provider.send(options)

                if (result.success) {
                    console.log(`✅ Email sent via ${provider.name}`)
                    return result
                }

                errors.push(`${provider.name}: ${result.error}`)
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error'
                errors.push(`${provider.name}: ${message}`)
                console.warn(`⚠️ ${provider.name} failed:`, message)
                // Continue to next provider
            }
        }

        // All providers failed
        const errorMessage = errors.join('; ')
        console.error('❌ All email providers failed:', errorMessage)

        return {
            success: false,
            provider: 'None',
            error: errorMessage,
        }
    }

    /**
     * Send email to multiple recipients
     */
    async sendBatch(recipients: string[], options: Omit<EmailOptions, 'to'>): Promise<EmailResult[]> {
        return Promise.all(
            recipients.map(to => this.send({ ...options, to }))
        )
    }
}

// Singleton instance
export const emailService = new EmailService()
