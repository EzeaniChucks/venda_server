"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const sendEmail = async (options) => {
    console.log('📧 Email would be sent:');
    console.log(`  To: ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    console.log(`  From: ${options.from || 'noreply@venda.com'}`);
    console.log(`  Body: ${options.html.substring(0, 100)}...`);
};
exports.sendEmail = sendEmail;
exports.default = { sendEmail: exports.sendEmail };
//# sourceMappingURL=emailService.js.map