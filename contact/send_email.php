<?php
// send_email.php
header('Content-Type: application/json');

// Allow CORS (if needed)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Configuration
$to_email = 'bharath@vmsd.in';
$from_email = 'junaid@bossco.in'; // Replace with your domain email
$site_name = 'bossco.in'; // Replace with your site name
$whatsappNumber = '918787545171'; // IMPORTANT: Replace with your WhatsApp number including country code

// Validate and sanitize input
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

try {
    // Get and validate form data
    $firstName = sanitizeInput($_POST['firstName'] ?? '');
    $lastName = sanitizeInput($_POST['lastName'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $phone = sanitizeInput($_POST['phone'] ?? '');
    $company = sanitizeInput($_POST['company'] ?? '');
    $subject = sanitizeInput($_POST['subject'] ?? '');
    $message = sanitizeInput($_POST['message'] ?? '');
    
    // Validation
    $errors = [];
    
    if (empty($firstName)) {
        $errors[] = 'First name is required';
    }
    
    if (empty($lastName)) {
        $errors[] = 'Last name is required';
    }
    
    if (empty($email)) {
        $errors[] = 'Email is required';
    } elseif (!validateEmail($email)) {
        $errors[] = 'Invalid email format';
    }
    
    if (empty($subject)) {
        $errors[] = 'Subject is required';
    }
    
    if (empty($message)) {
        $errors[] = 'Message is required';
    }
    
    // Check for errors
    if (!empty($errors)) {
        echo json_encode([
            'success' => false, 
            'message' => 'Please fix the following errors: ' . implode(', ', $errors)
        ]);
        exit;
    }
    
    // Prepare email content
    $fullName = $firstName . ' ' . $lastName;
    $emailSubject = "Contact Form: $subject - From $fullName";
    
    // Create HTML email body
    $emailBody = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-left: 10px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>New Contact Form Submission</h2>
                <p>You have received a new message from your website contact form.</p>
            </div>
            <div class='content'>
                <div class='field'>
                    <span class='label'>Name:</span>
                    <span class='value'>$fullName</span>
                </div>
                <div class='field'>
                    <span class='label'>Email:</span>
                    <span class='value'>$email</span>
                </div>";
    
    if (!empty($phone)) {
        $emailBody .= "
                <div class='field'>
                    <span class='label'>Phone:</span>
                    <span class='value'>$phone</span>
                </div>";
    }
    
    if (!empty($company)) {
        $emailBody .= "
                <div class='field'>
                    <span class='label'>Company:</span>
                    <span class='value'>$company</span>
                </div>";
    }
    
    $emailBody .= "
                <div class='field'>
                    <span class='label'>Subject:</span>
                    <span class='value'>$subject</span>
                </div>
                <div class='field'>
                    <span class='label'>Message:</span>
                    <div style='background: white; padding: 15px; border-radius: 5px; margin-top: 10px;'>
                        " . nl2br($message) . "
                    </div>
                </div>
                <hr style='margin: 20px 0;'>
                <p style='font-size: 12px; color: #666;'>
                    This email was sent from the contact form on $site_name at " . date('Y-m-d H:i:s') . "
                </p>
            </div>
        </div>
    </body>
    </html>";
    
    // Email headers
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . $site_name . ' <' . $from_email . '>',
        'Reply-To: ' . $fullName . ' <' . $email . '>',
        'X-Mailer: PHP/' . phpversion()
    ];
    
    // Send email
    $mailSent = mail($to_email, $emailSubject, $emailBody, implode("\r\n", $headers));
    
    if ($mailSent) {
        // Log the submission (optional)
        $logEntry = date('Y-m-d H:i:s') . " - Contact form submission from: $email ($fullName)\n";
        file_put_contents('contact_log.txt', $logEntry, FILE_APPEND | LOCK_EX);
        
        echo json_encode([
            'success' => true,
            'message' => 'Thank you for your message! We will get back to you soon.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Sorry, there was an error sending your message. Please try again later.'
        ]);
    }
    
} catch (Exception $e) {
    // Log the error (you might want to use a proper logging system)
    error_log("Contact form error: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred. Please try again later.'
    ]);
}

// Function to send acknowledgment email to user
function sendAcknowledgmentEmail($userEmail, $userName, $siteName, $fromEmail, $whatsappNumber) {
    $subject = "Thank you for contacting $siteName - We've received your message";
    
    $body = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            :root {
                --primary-color: #ff0055;
                --secondary-color: #00ff88;
                --background-color: #121212;
                --text-color: #ffffff;
                --card-color: #1e1e1e;
            }
            body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333;
                margin: 0;
                padding: 20px;
                background: #f4f4f4;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .header { 
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white; 
                padding: 30px 20px; 
                text-align: center;
            }
            .content { 
                padding: 30px 20px; 
                background: white;
            }
            .highlight {
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: bold;
            }
            .whatsapp-section {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid var(--secondary-color);
            }
            .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>$siteName</h1>
                <p>Thank you for reaching out to us!</p>
            </div>
            <div class='content'>
                <p>Dear <strong>$userName</strong>,</p>
                
                <p>We have successfully received your inquiry and want to thank you for contacting <span class='highlight'>$siteName</span>.</p>
                
                <p>Our team will review your message and get back to you as soon as possible. We typically respond to inquiries within 24-48 hours during business days.</p>
                
                <div class='whatsapp-section'>
                    <h3>Need Urgent Assistance?</h3>
                    <p>If your inquiry is <strong>urgent</strong> and requires immediate attention, please don't hesitate to reach out to us on WhatsApp:</p>
                    <p><strong>📱 WhatsApp: <a href='https://wa.me/$whatsappNumber' style='color: var(--secondary-color); text-decoration: none;'>$whatsappNumber</a></strong></p>
                    <p><em>We'll be happy to assist you right away!</em></p>
                </div>
                
                <p>We appreciate your interest in our services and look forward to helping you.</p>
                
                <p>Best regards,<br>
                <strong>The $siteName Team</strong></p>
            </div>
            <div class='footer'>
                <p>This is an automated response confirming receipt of your inquiry sent on " . date('Y-m-d H:i:s') . "</p>
                <p>Please do not reply to this email. If you need to send additional information, please use our contact form again or WhatsApp us.</p>
            </div>
        </div>
    </body>
    </html>";
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . $siteName . ' <' . $fromEmail . '>',
        'Reply-To: ' . $fromEmail,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    return mail($userEmail, $subject, $body, implode("\r\n", $headers));
}
?> $body, implode("\r\n", $headers));
}
?>