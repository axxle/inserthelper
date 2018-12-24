	/*Самовызываемая функция для заполнения примера запроса*/
	(function (){
		  document.getElementById("inputArea").value = "INSERT INTO persons	(id,	fullName, phoneNumber, timestamp ) VALUES	(persons_seq.nextVal(),	'Иванов Иван Иванович',	'+79221110022', to_timestamp('12.01.19 00:00:00,000000000','DD.MM.RR HH24:MI:SSXFF'))";
	}());

/**
 * 
 */
var extractTableNameSub = function(queryText) {
  var result = /[\s]{0,}insert[\s]{1,}into[\s]{1,}[\S]{1,}[\s]{0,}[\u0028]/i.exec(queryText);
  var result2 = /[\s]{0,}insert[\s]{1,}into[\s]{1,}/i.exec(result);
  var startNamePos = result2[0].length;
  return result[0].substring(startNamePos,result[0].length-1);
}

/**
 * 
 */
var testObject2 = {originalQueryText: "",
                  subTableName: "",
                  subCol: "",
                  subVal: "",
                  tableName: "",
                  arrCol: [], 
                  arrVal: []
                  };

/**
 * 
 */
var startWork = function () {
  var insertQueryText = document.getElementById("inputArea").value;
  var queryObject = parseSqlInsert(testObject2, insertQueryText);
  updateInsertView(queryObject);
}

/**
 * Парсинг текста запроса в объект типа QueryObject
 */
var parseSqlInsert = function (queryObject, insertQueryText) { 
  queryObject.originalQueryText = insertQueryText;
  queryObject.subTableName = extractTableNameSub(insertQueryText);
  parseTableName(queryObject);
  queryObject.subCol = parseColumns(insertQueryText);
  queryObject.subVal = extractValSub(insertQueryText);
  queryObject.arrCol = (""+queryObject.subCol).split(',');
  queryObject.arrVal = parseValues(queryObject.subVal);
  return queryObject;
}

/**
 * Обновление вью таблицы в браузере
 */
var updateInsertView = function (queryObject) { 
  document.getElementById("tableNameH1").innerText = queryObject.tableName;
  var mainTable = document.getElementById("mainTable");
  while(mainTable.rows[0]) mainTable.deleteRow(0);
  addRow("mainTable", queryObject);
}

/**
 * Добавление строк с названием колонок и добавляемыми значениями
 */
var addRow = function(tableID, queryObject) {
  var arrCell = queryObject.arrCol; 
  var arrVal = queryObject.arrVal; 
  var tableRef = document.getElementById(tableID);
  var newRow = tableRef.insertRow(-1);
  for(var i=0; i<arrCell.length; i++){
    var newCell = newRow.insertCell(-1);
    newCell.classList.add('col');
    var newText = document.createTextNode(arrCell[i]);
    newCell.appendChild(newText);
  }
  var newRow2 = tableRef.insertRow(-1);
  for(var i=0; i<arrVal.length; i++){
    var newCell = newRow2.insertCell(-1);
    newCell.classList.add('val');
    var newText = document.createTextNode(arrVal[i]);
    newCell.appendChild(newText);
  }
}

/**
* Проверяет, является ли строка запросом вида: INSERT INTO myTable (col1, col2, ...) VALUES (val1, val2, ...)
*/
var checkInsertValues = function() {
  var pos = testInsertQueryText.search(/[\s]{0,}insert[\s]{1,}into[\s]{1,}[\S]{1,}[\s]{0,}[\u0028].*[\u0029].*values[\s]{0,}[\u0028].*[\u0029][\s]{0,}[;]{0,}/i);
  var isInsertIntoMyTableValues = pos == 0 ? true : false;
  return isInsertIntoMyTableValues;
}

/**
 * Парсинг колонок (добработать для as )
 */
var parseColumns = function(queryText) {
  return extractColSub(queryText);
}


/**
 * Парсинг вставялемых значений
 */
var parseValues = function(subValText) {
  subValText = cleanOuterBrackets(subValText);
  var nestingBracketMatrix = getNestingBracketMatrix(subValText);
  var zArrPos = [];
  for (var i = 0; i < subValText.length; i++) {
    if (subValText[i] === ',' && nestingBracketMatrix[i] === 0) {
      zArrPos.push(i);
    }
  }
  var resultArr = [];
  var start = 0;
  var end = 0;
  for (var i = 0; i < zArrPos.length+1; i++) {
    if (i === 0) { 
      start = 0;
      end = zArrPos[i];
    } else { 
      start = zArrPos[i-1]+1;
      end = zArrPos[i];
    }
    if (i === zArrPos.length) { 
      end = subValText.length;
    }
    resultArr.push(subValText.substring(start, end));
  }
  return resultArr;
}

/**
 * Парсинг имени таблицы
 */
var parseTableName = function(queryObject) {
  queryObject.tableName = queryObject.subTableName;
}

/**
 * Извлечение подстроки, содержащей названия колонок
 */
var extractColSub = function(queryText) {
  var prefix = /[\s]{0,}insert[\s]{1,}into[\s]{1,}[\S]{1,}[\s]{0,}[\u0028]/i.exec(queryText);
  var startCol = prefix[0].length;
  var endCol = queryText.search(/[\u0029][\s]{0,}values[\s]{0,}[\u0028]/i);
  return queryText.substring(startCol, endCol);
}

/**
 * Извлечение подстроки, содержащей вставляемые значения и функции
 */
var extractValSub = function(queryText) {
  var result = /values[\s]{0,}[\u0028].*[\u0029]/i.exec(queryText);
  return result[0].substring(6,);
}

/**
 * Возвращает матрицу вложенности скобок в текст
 */
var getNestingBracketMatrix = function(text) {
  var nestingBracketMatrix = [];
  var counter = 0;
  for(var i = 0; i < text.length; i++) {
    if (text[i] === '(') {
      counter++;
    } else if (text[i] === ')') {
      counter--;
    }
    nestingBracketMatrix.push(counter);
  }
  return nestingBracketMatrix;
}

/**
 * Чистит строку от обрамляющих скобок
 */
var cleanOuterBrackets = function(originalText) {
  var clearText = "";
  var a = 0;
  var b = originalText.length;
  var nestingBracketMatrix = getNestingBracketMatrix(originalText);
  for(var i = 0; i < nestingBracketMatrix.length; i++){
    a++;
    if(nestingBracketMatrix[i] !== 0) {
      break;
    }
  }
  for(var i = nestingBracketMatrix.length; i > 0; i++){
    b--;
    if(nestingBracketMatrix[i] !== 0) {
      break;
    }
  }
  clearText = originalText.substring(a, b);
  return clearText;
}



