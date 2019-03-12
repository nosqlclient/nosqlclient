import { Template } from 'meteor/templating';

import './bypass_document_validation.html';
import { UIComponents } from '../../../modules';

Template.bypassDocumentValidation.onRendered(() => {
  UIComponents.Checkbox.init($('#inputBypassDocumentValidation'));
});
