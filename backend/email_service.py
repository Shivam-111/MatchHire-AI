"""
Email Service for MatchHire AI Platform
This module handles all email notifications using SMTP.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import threading


class EmailService:
    """Service class for sending emails via SMTP"""
    
    def __init__(
        self,
        smtp_host: str = None,
        smtp_port: int = None,
        smtp_user: str = None,
        smtp_password: str = None,
        use_tls: bool = True,
        from_name: str = "MatchHire AI"
    ):
        """
        Initialize email service with SMTP configuration.
        
        Args:
            smtp_host: SMTP server host
            smtp_port: SMTP server port (usually 587 for TLS, 465 for SSL)
            smtp_user: SMTP username/email
            smtp_password: SMTP password
            use_tls: Whether to use TLS (recommended)
            from_name: Name to display in "From" field
        """
        self.smtp_host = smtp_host or os.environ.get("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = smtp_port or int(os.environ.get("SMTP_PORT", "587"))
        self.smtp_user = smtp_user or os.environ.get("SMTP_USER", "")
        self.smtp_password = smtp_password or os.environ.get("SMTP_PASSWORD", "")
        self.use_tls = use_tls if use_tls is not None else True
        self.from_name = from_name
        self.from_email = self.smtp_user
        
    def is_configured(self) -> bool:
        """Check if email service is properly configured"""
        return bool(self.smtp_user and self.smtp_password)
    
    def _create_message(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: str = None
    ) -> MIMEMultipart:
        """Create email message with plain text and HTML versions"""
        msg = MIMEMultipart('alternative')
        msg['From'] = f"{self.from_name} <{self.from_email}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Attach plain text version
        text_part = MIMEText(body, 'plain')
        msg.attach(text_part)
        
        # Attach HTML version if provided
        if html_body:
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
            
        return msg
    
    def _send_email(self, to_email: str, msg: MIMEMultipart) -> bool:
        """Send email via SMTP"""
        try:
            # Connect to SMTP server
            if self.smtp_port == 465:
                # Use SSL
                server = smtplib.SMTP_SSL(self.smtp_host, self.smtp_port)
            else:
                # Use TLS
                server = smtplib.SMTP(self.smtp_host, self.smtp_port)
                if self.use_tls:
                    server.starttls()
            
            # Login
            server.login(self.smtp_user, self.smtp_password)
            
            # Send email
            server.send_message(msg)
            
            # Close connection
            server.quit()
            
            return True
            
        except Exception as e:
            print(f"Email sending failed: {str(e)}")
            return False
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: str = None,
        async_send: bool = False
    ) -> bool:
        """
        Send an email.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Plain text body
            html_body: HTML body (optional)
            async_send: If True, send in background thread
            
        Returns:
            True if sent successfully, False otherwise
        """
        if not self.is_configured():
            print("Email service not configured. Email not sent.")
            return False
            
        msg = self._create_message(to_email, subject, body, html_body)
        
        if async_send:
            thread = threading.Thread(
                target=self._send_email,
                args=(to_email, msg)
            )
            thread.daemon = True
            thread.start()
            return True
        else:
            return self._send_email(to_email, msg)
    
    # ---------------------------
    # Template Email Methods
    # ---------------------------
    
    def send_application_confirmation(
        self,
        to_email: str,
        candidate_name: str,
        job_title: str,
        company_name: str = "MatchHire AI Company"
    ) -> bool:
        """Send confirmation email when candidate applies for a job"""
        subject = f"Application Received - {job_title}"
        
        body = f"""Dear {candidate_name},

Thank you for applying for the position of {job_title} at {company_name}.

We have received your application and our team will review it shortly.
You will be notified if your qualifications match our requirements.

Best regards,
The MatchHire AI Team
"""
        
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #4F46E5; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background: #f9fafb; }}
        .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MatchHire AI</h1>
        </div>
        <div class="content">
            <h2>Application Received</h2>
            <p>Dear <strong>{candidate_name}</strong>,</p>
            <p>Thank you for applying for the position of <strong>{job_title}</strong> at <strong>{company_name}</strong>.</p>
            <p>We have received your application and our team will review it shortly.</p>
            <p>You will be notified if your qualifications match our requirements.</p>
        </div>
        <div class="footer">
            <p>© 2024 MatchHire AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""
        return self.send_email(to_email, subject, body, html_body)
    
    def send_recruiter_notification(
        self,
        to_email: str,
        recruiter_name: str,
        candidate_name: str,
        job_title: str,
        match_score: int
    ) -> bool:
        """Send notification to recruiter when they receive a new application"""
        subject = f"New Application for {job_title}"
        
        body = f"""Dear {recruiter_name},

You have received a new application for the position of {job_title}.

Candidate: {candidate_name}
Match Score: {match_score}%

Please log in to your MatchHire AI dashboard to review the application.

Best regards,
MatchHire AI Team
"""
        
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #4F46E5; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background: #f9fafb; }}
        .score {{ display: inline-block; background: #10B981; color: white; padding: 5px 15px; border-radius: 20px; }}
        .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MatchHire AI</h1>
        </div>
        <div class="content">
            <h2>New Application Received</h2>
            <p>Dear <strong>{recruiter_name}</strong>,</p>
            <p>You have received a new application for the position of <strong>{job_title}</strong>.</p>
            <h3>Application Details:</h3>
            <p><strong>Candidate:</strong> {candidate_name}</p>
            <p><strong>Match Score:</strong> <span class="score">{match_score}%</span></p>
            <p>Please log in to your MatchHire AI dashboard to review the application.</p>
        </div>
        <div class="footer">
            <p>© 2024 MatchHire AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""
        return self.send_email(to_email, subject, body, html_body)
    
    def send_interview_invitation(
        self,
        to_email: str,
        candidate_name: str,
        job_title: str,
        company_name: str,
        interview_date: str,
        interview_time: str,
        additional_info: str = ""
    ) -> bool:
        """Send interview invitation to candidate"""
        subject = f"Interview Invitation - {job_title}"
        
        body = f"""Dear {candidate_name},

Congratulations! Your application for the position of {job_title} at {company_name} has been shortlisted.

We would like to invite you for an interview:

Date: {interview_date}
Time: {interview_time}

{additional_info}

Please reply to confirm your availability.

Best regards,
{company_name} HR Team
"""
        
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #10B981; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background: #f9fafb; }}
        .details {{ background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }}
        .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Interview Invitation</h1>
        </div>
        <div class="content">
            <p>Dear <strong>{candidate_name}</strong>,</p>
            <p>Congratulations! Your application for the position of <strong>{job_title}</strong> at <strong>{company_name}</strong> has been shortlisted.</p>
            <div class="details">
                <h3>Interview Details:</h3>
                <p><strong>Date:</strong> {interview_date}</p>
                <p><strong>Time:</strong> {interview_time}</p>
                {f'<p><strong>Additional Info:</strong> {additional_info}</p>' if additional_info else ''}
            </div>
            <p>Please reply to confirm your availability.</p>
        </div>
        <div class="footer">
            <p>© 2024 MatchHire AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""
        return self.send_email(to_email, subject, body, html_body)
    
    def send_contact_notification(
        self,
        to_email: str,
        sender_name: str,
        message: str,
        job_title: str = None
    ) -> bool:
        """Send notification when recruiter contacts a candidate"""
        subject = f"Message from {sender_name}" + (f" - {job_title}" if job_title else "")
        
        body = f"""Dear Candidate,

You have received a message from {sender_name}:

"{message}"

{"Regarding: " + job_title if job_title else ""}

Log in to your MatchHire AI dashboard to respond.

Best regards,
MatchHire AI Team
"""
        
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #4F46E5; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background: #f9fafb; }}
        .message {{ background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #4F46E5; margin: 15px 0; }}
        .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MatchHire AI</h1>
        </div>
        <div class="content">
            <h2>New Message</h2>
            <p>You have received a message from <strong>{sender_name}</strong>.</p>
            {f'<p><strong>Regarding:</strong> {job_title}</p>' if job_title else ''}
            <div class="message">
                <p>"{message}"</p>
            </div>
            <p>Log in to your MatchHire AI dashboard to respond.</p>
        </div>
        <div class="footer">
            <p>© 2024 MatchHire AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""
        return self.send_email(to_email, subject, body, html_body)


# Create singleton instance
email_service = EmailService()


# Convenience functions
def send_application_confirmation(
    to_email: str,
    candidate_name: str,
    job_title: str,
    company_name: str = None
) -> bool:
    """Send application confirmation email"""
    return email_service.send_application_confirmation(
        to_email, candidate_name, job_title, company_name
    )


def send_recruiter_notification(
    to_email: str,
    recruiter_name: str,
    candidate_name: str,
    job_title: str,
    match_score: int
) -> bool:
    """Send notification to recruiter about new application"""
    return email_service.send_recruiter_notification(
        to_email, recruiter_name, candidate_name, job_title, match_score
    )


def send_contact_notification(
    to_email: str,
    sender_name: str,
    message: str,
    job_title: str = None
) -> bool:
    """Send notification when recruiter contacts candidate"""
    return email_service.send_contact_notification(
        to_email, sender_name, message, job_title
    )

