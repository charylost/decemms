// Google Apps Script to Handle Form Submissions and Send Emails
// 1. Go to script.google.com and sign in with decmanning92@gmail.com
// 2. Click "New Project"
// 3. Delete any code there and paste all of this code in.
// 4. Click the blue "Deploy" button at the top right, then "New deployment".
// 5. Click the gear icon next to "Select type" and choose "Web app".
// 6. Under "Execute as", choose "Me (decmanning92@gmail.com)".
// 7. Under "Who has access", choose "Anyone".
// 8. Click "Deploy" (you will need to authorize access to your Gmail).
// 9. Copy the "Web app URL" it gives you and paste it back to me!

function doPost(e) {
  try {
    var ownerEmail = "decmanning92@gmail.com";
    
    // Parse the data sent from the website
    var name = e.parameter.Name || '';
    var phone = e.parameter.Phone || '';
    var email = e.parameter.Email || '';
    var service = e.parameter.Service_Needed || '';
    var details = e.parameter.Project_Details || '';

    // 1. Send Email to the Business Owner (You)
    var ownerSubject = "New Quote Request from " + name;
    var ownerBody = "Name: " + name + "\n" +
                    "Email: " + email + "\n" +
                    "Phone: " + phone + "\n\n" +
                    "Service Needed: " + service + "\n\n" +
                    "Project Details:\n" + details;
                    
    MailApp.sendEmail({
      to: ownerEmail,
      subject: ownerSubject,
      body: ownerBody,
      replyTo: email
    });

    // 2. Send Auto-Responder Email to the Customer
    if (email !== "") {
      var customerSubject = "Thank you for your Quote Request - DecEmms Decorators";
      var customerBody = "Hi " + name + ",\n\n" +
                         "Thank you for requesting a free quote from DecEmms Decorators!\n\n" +
                         "We have received your details and will review your project shortly. " +
                         "We will be in touch with you as soon as possible.\n\n" +
                         "Best regards,\n" +
                         "DecEmms Decorators";
      
      MailApp.sendEmail({
        to: email,
        subject: customerSubject,
        body: customerBody,
        replyTo: ownerEmail,
        name: "DecEmms Decorators"
      });
    }

    return ContentService.createTextOutput(JSON.stringify({"result":"success", "message":"Message sent successfully!"}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"result":"error", "error": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle preflight CORS requests
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON);
}
