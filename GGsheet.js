// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Attendance and Registration Mode.
// ________________________________________________________________________________ doGet()
function doGet(e) { 
  Logger.log(JSON.stringify(e));
  var result = '';
  if (e.parameter == 'undefined') {
    result = 'No_Parameters';
  } else {
    var sheet_id = '1PfmnkHnWmpQnzte6_hbE78ZIppOOhmKabH8JY_-GC-8';  // Spreadsheet ID.
    var sheet_UD = 'User_Data';  // Sheet name for user data.
    var sheet_AT = 'Attendance';  // Sheet name for attendance.

    var sheet_open = SpreadsheetApp.openById(sheet_id);
    var sheet_user_data = sheet_open.getSheetByName(sheet_UD);
    var sheet_attendence = sheet_open.getSheetByName(sheet_AT);
    
    var sts_val = "";  // Status from ESP32.
    var uid_val = "";  // UID of RFID.
    var msv_val = "";  // MSV value.
    var uid_column = "B";  // Column for UID in "User_Data".
    var TI_val = "";  // Variable for Time In value.
    var Date_val = "";  // Variable for Date value.
    
    //----------------------------------------Retrieves the value of the parameter sent by the ESP32.
    for (var param in e.parameter) {
      Logger.log('In for loop, param=' + param);
      var value = stripQuotes(e.parameter[param]);
      Logger.log(param + ':' + e.parameter[param]);
      switch (param) {
        case 'sts':
          sts_val = value;
          break;

        case 'uid':
          uid_val = value;
          break;
          
        case 'msv':  // Retrieve MSV parameter.
          msv_val = value;
          break;

        default:
          // Unsupported parameter.
      }
    }
    //----------------------------------------

    // Registering new users.
    if (sts_val == 'reg') {
      var check_new_UID = checkUID(sheet_id, sheet_UD, 2, uid_val);
      
      if (check_new_UID == true) {
        result += "regErr01"; // UID is already registered.
        return ContentService.createTextOutput(result);
      }

      var getLastRowUIDCol = findLastRow(sheet_id, sheet_UD, uid_column);
      var newUID = sheet_open.getRange(uid_column + (getLastRowUIDCol + 1));
      newUID.setValue(uid_val);
      sheet_user_data.getRange(getLastRowUIDCol + 2, 1).setValue(name_val);
      sheet_user_data.getRange(getLastRowUIDCol + 2, 4).setValue(msv_val);  // Store MSV in column D.
      result += ",R_Successful";
      return ContentService.createTextOutput(result);
    }

    // Handling attendance (TimeIn and TimeOut).
    if (sts_val == 'atc') {
      var FUID = findUID(sheet_id, sheet_UD, 2, uid_val);
      
      if (FUID == -1) {
        result += "atcErr01"; // UID not registered.
        return ContentService.createTextOutput(result);
      } else {
        var get_Range = sheet_user_data.getRange("A" + (FUID + 2));
        var user_name_by_UID = get_Range.getValue();
        var user_msv_by_UID = sheet_user_data.getRange(FUID + 2, 4).getValue(); // Get MSV for the user.

        var Curr_Date = Utilities.formatDate(new Date(), "Asia/Jakarta", 'dd/MM/yyyy');
        var Curr_Time = Utilities.formatDate(new Date(), "Asia/Jakarta", 'HH:mm:ss');

        var data = sheet_attendence.getDataRange().getDisplayValues();
        var enter_data = "time_in";  // Default to Time In.
        var num_row;

        if (data.length > 1) {
          for (var i = 0; i < data.length; i++) {
            if (data[i][1] == uid_val) {
              if (data[i][2] == Curr_Date) {
                if (data[i][4] == "") {  // Check if TimeOut is empty.
                  enter_data = "time_out";
                  num_row = i + 1;
                  break;
                }
              }
            }
          }
        }

        // Handling TimeIn.
        if (enter_data == "time_in") {
          sheet_attendence.insertRows(2);  // Insert new row at the top.
          sheet_attendence.getRange("A2").setValue(user_name_by_UID);
          sheet_attendence.getRange("B2").setValue(uid_val);
          sheet_attendence.getRange("C2").setValue(Curr_Date);
          sheet_attendence.getRange("D2").setValue(Curr_Time);
          sheet_attendence.getRange("F2").setValue(user_msv_by_UID);  // Store MSV in column F.
          SpreadsheetApp.flush();

          result += ",TI_Successful" + "," + user_name_by_UID + "," + Curr_Date + "," + Curr_Time;
          return ContentService.createTextOutput(result);
        }

        // Handling TimeOut.
        if (enter_data == "time_out") {
          sheet_attendence.getRange("E" + num_row).setValue(Curr_Time);
          sheet_attendence.getRange("F" + num_row).setValue(user_msv_by_UID);  // Store MSV in column F on TimeOut.
          result += ",TO_Successful" + "," + user_name_by_UID + "," + Curr_Date + "," + Curr_Time;
          return ContentService.createTextOutput(result);
        }
      }
    }
  }
}

// Helper functions (same as before).

function stripQuotes(value) {
  return value.replace(/^["']|['"]$/g, "");
}

function findLastRow(id_sheet, name_sheet, name_column) {
  var spreadsheet = SpreadsheetApp.openById(id_sheet);
  var sheet = spreadsheet.getSheetByName(name_sheet);
  var lastRow = sheet.getLastRow();

  var range = sheet.getRange(name_column + lastRow);

  if (range.getValue() !== "") {
    return lastRow;
  } else {
    return range.getNextDataCell(SpreadsheetApp.Direction.UP).getRow();
  }
}

function findUID(id_sheet, name_sheet, column_index, searchString) {
  var open_sheet = SpreadsheetApp.openById(id_sheet);
  var sheet = open_sheet.getSheetByName(name_sheet);
  var columnValues = sheet.getRange(2, column_index, sheet.getLastRow()).getValues();
  var searchResult = columnValues.findIndex(searchString);

  return searchResult;
}

function checkUID(id_sheet, name_sheet, column_index, searchString) {
  var open_sheet = SpreadsheetApp.openById(id_sheet);
  var sheet = open_sheet.getSheetByName(name_sheet); 
  var columnValues = sheet.getRange(2, column_index, sheet.getLastRow()).getValues();
  var searchResult = columnValues.findIndex(searchString);

  if (searchResult != -1) {
    sheet.setActiveRange(sheet.getRange(searchResult + 2, 3)).setValue("UID has been registered in this row.");
    return true;
  } else {
    return false;
  }
}

Array.prototype.findIndex = function(search) {
  if (search == "") return false;
  for (var i = 0; i < this.length; i++)
    if (this[i].toString().indexOf(search) > -1) return i;

  return -1;
}

function checkTimeout() {
  var sheet_id = '1PfmnkHnWmpQnzte6_hbE78ZIppOOhmKabH8JY_-GC-8';
  var sheet_AT = 'Attendance';
  var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName(sheet_AT);
  var data = sheet.getDataRange().getValues();
  var currentTime = new Date();

  for (var i = 1; i < data.length; i++) {
    var dateValue = data[i][2]; // Cột C là ngày (cột Date).
    var timeIn = data[i][3]; // Cột D là TimeIn.
    var timeOutVal = data[i][4]; // Cột E là TimeOut.

    Logger.log("Date Value from Sheet: " + dateValue);
    Logger.log("TimeIn Value from Sheet: " + timeIn);

    // Kiểm tra nếu dateValue là đối tượng Date và chưa có TimeOut.
    if (dateValue instanceof Date && !timeOutVal) {
      // Lấy ngày từ dateValue
      var timeInDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
      // Lấy ngày hiện tại
      var currentDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());

      Logger.log("Current Date: " + currentDate);
      Logger.log("TimeIn Date: " + timeInDate);

      // Nếu đã qua ngày của TimeIn mà chưa có TimeOut.
      if (currentDate >= timeInDate) {
        var elapsedTime = (currentTime - timeIn) / 1000; // Tính thời gian đã trôi qua

        Logger.log("Elapsed Time (s): " + elapsedTime);

        // Nếu đã quá 3000 giây từ thời điểm TimeIn mà chưa có TimeOut.
        if (elapsedTime > 3000) {
          var timeOutCell = sheet.getRange(i + 1, 5); // Cột E của hàng hiện tại
          timeOutCell.setNumberFormat('@STRING@'); // Đặt định dạng về dạng văn bản
          timeOutCell.setValue("-1"); // Cập nhật TimeOut thành -1
          Logger.log("Updated TimeOut to -1 for Row: " + (i + 1));
        }
      }
    }
  }
  SpreadsheetApp.flush(); // Đảm bảo thay đổi được áp dụng ngay.
}
// function checkTimeout() {
//   var sheet_id = '1PfmnkHnWmpQnzte6_hbE78ZIppOOhmKabH8JY_-GC-8';
//   var sheet_AT = 'Attendance';
//   var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName(sheet_AT);
//   var data = sheet.getDataRange().getValues();

//   for (var i = 1; i < data.length; i++) {
//     var timeOutVal = data[i][4]; // Column E for TimeOut.

//     // If TimeOut is empty, set it to -1.
//     if (!timeOutVal) {
//       var timeOutCell = sheet.getRange(i + 1, 5); // Column E of the current row.
//       timeOutCell.setNumberFormat('@STRING@'); // Set format to text.
//       timeOutCell.setValue("-1"); // Update TimeOut to -1.
//       Logger.log("Updated TimeOut to -1 for Row: " + (i + 1));
//     }
//   }
//   SpreadsheetApp.flush(); // Ensure changes are applied immediately.
// }
