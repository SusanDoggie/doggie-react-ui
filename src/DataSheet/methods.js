//
//  methods.js
//
//  The MIT License
//  Copyright (c) 2015 - 2022 Susan Cheng. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import _ from 'lodash';
import { EJSON } from 'bson';
import { encode_value } from './encode_value';
import { tsvFormatRows } from 'd3-dsv';

export const default_state = {
    selecting_rows: null,
    selected_rows: [],
    selecting_cells: null,
    selected_cells: null,
    shiftKey: false,
    metaKey: false,
    editing: null,
};

function is_child_node(parent, node) {
    while (node !== document) {
        if (node === parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

export const useMethods = ({
    state, 
    setState,
    tableRef,
    editingRef,
    data,
    columns,
    encodeValue,
    allowSelection,
    allowEditForCell,
    onDeleteRows,
    onDeleteCells,
    onCopyRows,
    onCopyCells,
    onPasteRows,
    onPasteCells,
    onEndEditing,
}) => {

    function _current_selected_rows(e) {

        if (allowSelection !== true) return [];

        if (_.isEmpty(state.selecting_rows)) {
            return state.selected_rows;
        }
    
        const min_row = Math.min(state.selecting_rows.start_row, state.selecting_rows.end_row);
        const max_row = Math.max(state.selecting_rows.start_row, state.selecting_rows.end_row);
    
        const key_events = e ?? state;
    
        if (key_events.shiftKey) {
    
            const selecting_rows = new Set(state.selected_rows);
    
            for (let row = min_row; row <= max_row; row++) {
                selecting_rows.add(row);
            }
    
            return [...selecting_rows].sort();
        } 
        
        if (key_events.metaKey) {
    
            const selecting_rows = new Set(state.selected_rows);
    
            for (let row = min_row; row <= max_row; row++) {
                if (selecting_rows.has(row)) {
                    selecting_rows.delete(row);
                } else {
                    selecting_rows.add(row);
                }
            }
    
            return [...selecting_rows].sort();
        } 
    
        const selecting_rows = new Set();
    
        for (let row = min_row; row <= max_row; row++) {
            selecting_rows.add(row);
        }
    
        return [...selecting_rows].sort();
    }

    function _current_selected_cells(e) {

        if (allowSelection !== true) return {};

        if (_.isEmpty(state.selecting_cells)) {
            return state.selected_cells;
        }
    
        const { start_row, start_col, end_row, end_col } = state.selecting_cells;
        const min_row = Math.min(start_row, end_row);
        const max_row = Math.max(start_row, end_row);
        const min_col = Math.min(start_col, end_col);
        const max_col = Math.max(start_col, end_col);

        const key_events = e ?? state;
        
        if (key_events.shiftKey || key_events.metaKey) {
    
            if (!_.isEmpty(state.selected_cells)) {
                
                const { start_row: _start_row, start_col: _start_col, end_row: _end_row, end_col: _end_col } = state.selected_cells;
                const _min_row = Math.min(min_row, _start_row, _end_row);
                const _max_row = Math.max(max_row, _start_row, _end_row);
                const _min_col = Math.min(min_col, _start_col, _end_col);
                const _max_col = Math.max(max_col, _start_col, _end_col);

                return {
                    start_row: _min_row,
                    start_col: _min_col,
                    end_row: _max_row,
                    end_col: _max_col,
                };
            }
        }

        return {
            start_row: min_row,
            start_col: min_col,
            end_row: max_row,
            end_col: max_col,
        };
    }
    
    function onMouseDown(e) {

        if (!_.isNil(editingRef.current) && !_.isNil(state.editing)) {

            if (!is_child_node(editingRef.current, e.target)) {
            
                onEndEditing(state.editing.row, state.editing.col);
                setState({ editing: null });
            }
        }

        if (allowSelection !== true) return;

        if (!_.isEmpty(state.selected_rows) || !_.isEmpty(state.selected_cells)) {
    
            if (!is_child_node(tableRef.current, e.target)) {
            
                setState({ selecting_rows: null, selected_rows: [], selecting_cells: null, selected_cells: null, editing: null });
            }
        }
    }
    
    function onMouseUp(e) {
    
        if (allowSelection !== true) return;

        if (!_.isEmpty(state.selecting_rows)) {
    
            setState({ selecting_rows: null, selected_rows: _current_selected_rows(e), selected_cells: null, editing: null });
        }
    
        if (!_.isEmpty(state.selecting_cells)) {
    
            setState({ selecting_cells: null, selected_cells: _current_selected_cells(e), selected_rows: [], editing: null });
        }
    }
    
    function handleRowMouseDown(e, row) {
    
        if (allowSelection !== true) return;

        setState({ selecting_rows: { start_row: row, end_row: row }, shiftKey: e.shiftKey, metaKey: e.metaKey, editing: null });
    }
    
    function handleRowMouseOver(e, row) {
    
        if (allowSelection !== true) return;
        if (_.isEmpty(state.selecting_rows)) return;
    
        setState({ selecting_rows: { ...state.selecting_rows, end_row: row }, shiftKey: e.shiftKey, metaKey: e.metaKey, editing: null });
    }
    
    function handleCellMouseDown(e, row, col) {
    
        if (allowSelection !== true) return;

        setState({ selecting_cells: { start_row: row, start_col: col, end_row: row, end_col: col }, shiftKey: e.shiftKey, metaKey: e.metaKey, editing: null });
    }
    
    function handleCellMouseOver(e, row, col) {

        if (allowSelection !== true) return;
        if (_.isEmpty(state.selecting_cells)) return;
    
        setState({ selecting_cells: { ...state.selecting_cells, end_row: row, end_col: col }, shiftKey: e.shiftKey, metaKey: e.metaKey, editing: null });
    }
    
    function handleCellDoubleClick(e, row, col) {

        if (allowEditForCell === true || (_.isFunction(allowEditForCell) && allowEditForCell(row, col) === true)) {
            setState({ ...default_state, editing: { row, col } });
        }
    }

    function handleKey(e) {
    
        if (allowSelection !== true) return;

        if (e.ctrlKey) {
            if (e.keyCode === 67) {
              handleCopy(e);
            } else if (e.keyCode === 86 || e.which === 86) {
              handlePaste(e);
            }
        }
    
        if (e.keyCode === 8 || e.keyCode === 46) {
            handleDelete(e);
        }
    }
    
    function handleDelete(e) {
    
        if (allowSelection !== true) return;

        const selected_rows = state.selected_rows.sort().filter(x => x < data.length);

        if (!_.isEmpty(selected_rows)) {
    
            e.preventDefault();
            
            if (_.isFunction(onDeleteRows)) {
                onDeleteRows(selected_rows);
            }
        }
    
        if (!_.isEmpty(state.selected_cells)) {
    
            e.preventDefault();
            
            if (_.isFunction(onDeleteCells)) {
            
                const { start_row, start_col, end_row, end_col } = state.selected_cells;
        
                const min_row = Math.min(start_row, end_row);
                const max_row = Math.max(start_row, end_row);
                const min_col = Math.min(start_col, end_col);
                const max_col = Math.max(start_col, end_col);
                
                onDeleteCells({ start_row: min_row, start_col: min_col, end_row: max_row, end_col: max_col });
            }
        }
    }
    
    function handleCopy(e) {
    
        if (allowSelection !== true) return;

        const selected_rows = state.selected_rows.sort().filter(x => x < data.length);

        if (!_.isEmpty(selected_rows)) {
    
            e.preventDefault();
            
            if (_.isFunction(onCopyRows)) {
    
                const _data = _.map(selected_rows, row => _.pick(data[row], columns));
                onCopyRows(selected_rows, _data);
    
            } else {
                
                const _data = _.map(selected_rows, row => _.map(columns, col => data[row][col]));
                e.clipboardData.setData('application/json', EJSON.stringify(_data));
                
                const text = _data.map(row => _.map(row, val => _.isFunction(encodeValue) ? encodeValue(val) : `${encode_value(val)}`));
                e.clipboardData.setData('text/plain', tsvFormatRows(text));
            }
        }
    
        if (!_.isEmpty(state.selected_cells)) {
    
            e.preventDefault();
            
            const { start_row, start_col, end_row, end_col } = state.selected_cells;
    
            const min_row = Math.min(start_row, end_row);
            const max_row = Math.max(start_row, end_row);
            const min_col = Math.min(start_col, end_col);
            const max_col = Math.max(start_col, end_col);
    
            const _rows = _.range(min_row, max_row + 1);
            const _cols = _.range(min_col, max_col + 1);
    
            if (_.isFunction(onCopyCells)) {
    
                const _data = _.map(_rows, row => _.pick(data[row], _.map(_cols, col => columns[col])));
                onCopyCells({ start_row: min_row, start_col: min_col, end_row: max_row, end_col: max_col }, _data);
    
            } else {
                
                const _data = _.map(_rows, row => _.map(_cols, col => data[row][columns[col]]));
                e.clipboardData.setData('application/json', EJSON.stringify(_data));
                
                const text = _data.map(row => _.map(row, val => _.isFunction(encodeValue) ? encodeValue(val) : `${encode_value(val)}`));
                e.clipboardData.setData('text/plain', tsvFormatRows(text));
            }
        }
    }
    
    function handlePaste(e) {
    
        if (allowSelection !== true) return;

        if (!_.isEmpty(state.selected_rows)) {
    
            e.preventDefault();
            
            if (_.isFunction(onPasteRows)) {
                onPasteRows(state.selected_rows.sort());
            }
        }
    
        if (!_.isEmpty(state.selected_cells)) {
    
            e.preventDefault();
            
            if (_.isFunction(onPasteCells)) {

                const { start_row, start_col, end_row, end_col } = state.selected_cells;
        
                const min_row = Math.min(start_row, end_row);
                const max_row = Math.max(start_row, end_row);
                const min_col = Math.min(start_col, end_col);
                const max_col = Math.max(start_col, end_col);
        
                onPasteCells({ start_row: min_row, start_col: min_col, end_row: max_row, end_col: max_col });
            }
        }
    }
    
    return {
        _current_selected_rows,
        _current_selected_cells,
        onMouseDown,
        onMouseUp,
        handleRowMouseDown,
        handleRowMouseOver,
        handleCellMouseDown,
        handleCellMouseOver,
        handleCellDoubleClick,
        handleKey,
        handleCopy,
        handlePaste,
    };
};
