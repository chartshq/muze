/* eslint-disable */

function abc() {
  var arr1 = [4, 1, 1, 2, 3], arr2 = [1, 2, 3, 5, 6];
  var startIndexArr1 = arr1.lastIndexOf(arr2[0]);
  console.log('1-------->', startIndexArr1);
  var flag = 1;
  var startIndexArr2 = 0;
  var count = 0;
  while (flag === 1) {
    console.log('2------------>', count, arr1[startIndexArr1], arr2[startIndexArr2]);
    if (arr1[startIndexArr1] && arr2[startIndexArr2] && arr1[startIndexArr1] === arr2[startIndexArr2]) {
      startIndexArr1++;
      startIndexArr2++;
      count++;
    } else {
      flag = 0;
      if(arr1[startIndexArr1] || arr2[startIndexArr2]){
        count = 0
      }
    }
  }
  return count;
};
abc();
