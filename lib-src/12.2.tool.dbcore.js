/**
 * 
 * @param sheet
 * @param headerRowPosition
 * @param optStartColumn
 * @param optWidth - actual Header and range width, needed to be specified in case ti is shorter then data range in the header row
 * @constructor
 */
function DBCore(sheet, headerRowPosition, optStartColumn, optWidth) {
    var t = this;
    t._sheet = sheet;
    t._startColumn = optStartColumn || 1;
    
    t._headerRowPos = headerRowPosition;
    t._header = Lib.util.getRange(
        t._sheet,
        [t._headerRowPos, t._startColumn], [1, optWidth || null]
    ).getValues()[0];
    
    t._width = t._header.length;
    t._height = 0;
    
    t._initActualRange();
}


DBCore.prototype.getRowBase = function () {
    return this._headerRowPos;
};


DBCore.prototype._initActualRange = function () {
    var t = this;
    t._range = Lib.util.getRange(
        t._sheet,
        [t._headerRowPos + 1, t._startColumn], [null, t._width]
    );
    if (t._range !== null) {
        t._height = t._range.getHeight();
    }
};


DBCore.prototype._checkConstraints = function (data) {
    var t = this;
    if (data[0].length !== t._width) {
        throw Error("Data width =" + data[0].length + " !== range width =" + t._width);
    }
};


DBCore.prototype._subset = function (startOffset, rowNumber) {
    var t = this;
    if (t._range === null) return null;
    if (!startOffset && !rowNumber) return t._range; //optimization
    return t._range.offset(startOffset || 0, 0, rowNumber || t._height, t._width);
};


DBCore.prototype.get = function (optStartRowPos, optRowsNumber) {
    var t = this;
    if (t._range === null) return null;
    var res = t._range.getValues();
    if (optStartRowPos || optRowsNumber){
        optStartIndex = (optStartRowPos || 1) - 1;
        optRowsNumber = optRowsNumber || t._height;
        res = res.slice(optStartIndex, optStartIndex + optRowsNumber);
    }
    return res;
};

DBCore.prototype.getOne = function (rowPosition) {
    if (this._range === null) return null;
    return this._range.getValues()[rowPosition - 1];
};


DBCore.prototype.getLast = function () {
    if (this._range === null) return null;
    return this._range.getValues()[this._height - 1];
};



DBCore.prototype.getHeader = function () {
    return this._header;
};


DBCore.prototype.update = function (startRowNumber, data) {
    var t = this;
    t._checkConstraints(data);
    const subs = t._subset(startRowNumber - 1, data.length);
    if (subs !== null){
        subs.setValues(data);
        return true;
    }
    return false;
};

DBCore.prototype.updateOne = function (rowNumber, row) {
    "use strict";
    return this.update(rowNumber, [row]);
};

/**
 * Rewrites existing data with new
 * @param data
 * @returns {boolean}
 */
DBCore.prototype.rewriteAll = function (data) {
    var t = this;
    t._checkConstraints(data);
    if (t._range) t._range.clearContent();
    return t._appendRows(data);
};

/**
 * Appends to existing records
 * @param row
 * @returns {boolean}
 */
DBCore.prototype.appendOne = function (row) {
    return this.append([row]);
};


DBCore.prototype.append = function (data) {
    var t = this;
    t._checkConstraints(data);
    return t._appendRows(data);
};


DBCore.prototype._appendRows = function (data) {
    var t = this;
    var res = Lib.util.writeRows(t._sheet, data, t._startColumn);
     t._initActualRange();
    //SpreadsheetApp.flush();
    return true
};

/**
 *
 * @param criteria - {index: value, index2: value2...}
 * @param startOffset
 * @param limit
 */
/*DBManager.prototype.selectRows = function (criteria, startOffset, limit) {
    var t = this,
        rows = [],
        matches = 0;
        
    limit = limit || 1e+20;
    startOffset = startOffset || 0;
    
    var values = t._range.getValues();
    var criteriaNumber = Object.keys(criteria).length;
    
    for (var i = 0; i < values.length; i++) {
        if (criteriaNumber) {
            var matched = true;
            for (var c in criteria) {
                if (values[i][c].toString().indexOf(criteria[c]) === -1) {
                    matched = false;
                    break;
                }
            }
            if (! matched) continue;
        }
        matches++;
        if (matches >= startOffset) {
            rows.push(values[i]);
            if (rows.length >= limit) break;
        }
    }
    return rows;
}*/

Lib.tool.DBCore = DBCore;