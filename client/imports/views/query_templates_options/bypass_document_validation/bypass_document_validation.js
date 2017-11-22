import { Template } from 'meteor/templating';

import './bypass_document_validation.html';

Template.bypassDocumentValidation.onRendered(() => {
  $('#divBypassDocumentValidation').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});
