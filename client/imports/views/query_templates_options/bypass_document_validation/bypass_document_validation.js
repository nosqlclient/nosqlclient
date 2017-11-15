/**
 * Created by sercan on 09.12.2016.
 */
import { Template } from 'meteor/templating';

import './bypass_document_validation.html';

Template.bypassDocumentValidation.onRendered(() => {
  $('#divBypassDocumentValidation').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
});
