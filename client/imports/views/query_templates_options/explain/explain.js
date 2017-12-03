import { Template } from 'meteor/templating';

import './explain.html';

Template.explain.onRendered(() => {
  $('#divExplain').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
  $('#inputExplain').iCheck('uncheck');
});
