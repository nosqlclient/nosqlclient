import { $ } from 'meteor/jquery';
import './mongoimport_options.html';

export const getMongoimportOptions = function () {
  const result = [];

  const args = $('#cmbMongoimportArgs').val();
  if (!args) return result;
  for (const arg of args) {
    const argElement = $(`#mongoimport${arg}`);
    result.push(arg);

    if (argElement.length !== 0) result.push(argElement.val());
  }

  return result;
};
