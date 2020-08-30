const Auth = require('../middleware/auth');
const MailTemplateController = require('../controllers/TemplateController');
module.exports = (router) => {
    router.get('', Auth.validateToken, MailTemplateController.getTemplates);
    router.get('/:id', Auth.validateToken, MailTemplateController.getTemplate);
    router.post('', Auth.validateToken, MailTemplateController.createTemplate);
    router.put('/:id', Auth.validateToken, MailTemplateController.updateTemplate);
    router.delete('/:id', Auth.validateToken, MailTemplateController.deleteTemplate);
}