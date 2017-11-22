import { Template } from 'meteor/templating';

import './explain.html';

Template.explain.onRendered(() => {
  $('#divExecuteExplain').iCheck({
    checkboxClass: 'icheckbox_square-green',
  });
  $('#inputExecuteExplain').iCheck('uncheck');
});
