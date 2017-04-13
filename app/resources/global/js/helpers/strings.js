/*
* checks if string ends with given string
* @param1 {String} str
* @return {Boolean}
*/
String.prototype.endsWith = function (str) {
  return this.indexOf(str, this.length - str.length) !== -1
}
/*
* replaces all in string
* @param1 {String} what
* @param2 {String} to
* @return {String}
*/
String.prototype.replaceAll = function (what, to) {
  return this.replace(new RegExp(what, 'g'), to);
}
