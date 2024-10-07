document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('task-table');
    const columnControl = document.getElementById('column-control');
    const columnCheckboxes = document.getElementById('column-checkboxes');
    const selectAll = document.getElementById('select-all');
    const deselectAll = document.getElementById('deselect-all');
    const moveUp = document.getElementById('move-up');
    const moveDown = document.getElementById('move-down');
    const resetOrder = document.getElementById('reset-order');

    let columns = Array.from(table.querySelectorAll('th')).map((th, index) => ({
        index: index,
        name: th.textContent.trim(),
        visible: true
    }));

    // Load saved configuration
    loadConfig();

    // Initialize column control
    initColumnControl();

    // Add column resizing functionality
    applyColumnVisibility();
    applyColumnWidths();
    // const table = document.getElementById('task-table');
    let currentResizer;

    function createResizableColumn(th) {
        const resizer = document.createElement('div');
        resizer.classList.add('resizer');
        th.appendChild(resizer);
        th.style.position = 'relative';
    
        let x = 0;
        let w = 0;
    
        const mouseDownHandler = function(e) {
            x = e.clientX;
            const styles = window.getComputedStyle(th);
            w = parseInt(styles.width, 10);
    
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
    
            resizer.classList.add('resizing');
        };
    
        const mouseMoveHandler = function(e) {
            const dx = e.clientX - x;
            th.style.width = `${w + dx}px`;
    
            // Adjust the width of all cells in this column
            const index = Array.from(th.parentNode.children).indexOf(th);
            table.querySelectorAll(`tr > *:nth-child(${index + 1})`).forEach(cell => {
                cell.style.width = `${w + dx}px`;
            });
        };
    
        const mouseUpHandler = function() {
            resizer.classList.remove('resizing');
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            saveConfig(); // Lưu cấu hình sau khi thay đổi kích thước
        };
    
        resizer.addEventListener('mousedown', mouseDownHandler);
    }function createResizableColumn(th) {
        const resizer = document.createElement('div');
        resizer.classList.add('resizer');
        th.appendChild(resizer);
    
        let x = 0;
        let w = 0;
    
        const mouseDownHandler = function(e) {
            x = e.clientX;
            const styles = window.getComputedStyle(th);
            w = parseInt(styles.width, 10);
    
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
    
            resizer.classList.add('resizing');
        };
    
        const mouseMoveHandler = function(e) {
            const dx = e.clientX - x;
            th.style.width = `${w + dx}px`;
    
            // Adjust the width of all cells in this column
            const index = Array.from(th.parentNode.children).indexOf(th);
            table.querySelectorAll(`tr > *:nth-child(${index + 1})`).forEach(cell => {
                cell.style.width = `${w + dx}px`;
            });
        };
    
        const mouseUpHandler = function() {
            resizer.classList.remove('resizing');
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            saveConfig(); // Add this line
        };
    
        resizer.addEventListener('mousedown', mouseDownHandler);
    }

    // Apply resizable columns
    function applyResizableColumns() {
        table.querySelectorAll('th').forEach(th => createResizableColumn(th));
    }

    // Call this function after the table is created or updated
    applyResizableColumns();

    // Event listeners
    columnControl.addEventListener('click', openColumnControlModal);
    selectAll.addEventListener('click', selectAllColumns);
    deselectAll.addEventListener('click', deselectAllColumns);
    moveUp.addEventListener('click', moveColumnUp);
    moveDown.addEventListener('click', moveColumnDown);
    resetOrder.addEventListener('click', resetColumnOrder);

    function initColumnControl() {
        columnCheckboxes.innerHTML = '';
        columns.forEach((column, index) => {
            const checkbox = document.createElement('div');
            checkbox.className = 'column-checkbox';
            checkbox.innerHTML = `
                <input type="checkbox" id="col-${index}" ${column.visible ? 'checked' : ''}>
                <label for="col-${index}">${column.name}</label>
            `;
            checkbox.querySelector('input').addEventListener('change', (e) => toggleColumn(index, e.target.checked));
            columnCheckboxes.appendChild(checkbox);
        });
        applyColumnVisibility();
    }

    function openColumnControlModal() {
        const modal = new bootstrap.Modal(document.getElementById('columnControlModal'));
        modal.show();
    }

    function toggleColumn(index, visible) {
        columns[index].visible = visible;
        applyColumnVisibility();
        saveConfig();
    }

    function selectAllColumns() {
        columns.forEach(column => column.visible = true);
        initColumnControl();
        applyColumnVisibility();
        saveConfig();
    }

    function deselectAllColumns() {
        columns.forEach(column => column.visible = false);
        initColumnControl();
        applyColumnVisibility();
        saveConfig();
    }

    function moveColumnUp() {
        const selected = getSelectedCheckbox();
        if (selected && selected.index > 0) {
            swapColumns(selected.index, selected.index - 1);
            initColumnControl();
            applyColumnVisibility();
            saveConfig();
        }
    }

    function moveColumnDown() {
        const selected = getSelectedCheckbox();
        if (selected && selected.index < columns.length - 1) {
            swapColumns(selected.index, selected.index + 1);
            initColumnControl();
            applyColumnVisibility();
            saveConfig();
        }
    }

    function resetColumnOrder() {
        columns.sort((a, b) => a.index - b.index);
        initColumnControl();
        applyColumnVisibility();
        saveConfig();
    }

    function getSelectedCheckbox() {
        const checkedBox = columnCheckboxes.querySelector('input:checked');
        return checkedBox ? columns[parseInt(checkedBox.id.split('-')[1])] : null;
    }

    function swapColumns(index1, index2) {
        [columns[index1], columns[index2]] = [columns[index2], columns[index1]];
        columns[index1].index = index1;
        columns[index2].index = index2;
    }

    function applyColumnVisibility() {
        columns.forEach((column, index) => {
            const cells = table.querySelectorAll(`tr > *:nth-child(${index + 1})`);
            cells.forEach(cell => {
                if (column.visible) {
                    cell.style.display = '';
                    if (column.width) {
                        cell.style.width = column.width;
                    }
                } else {
                    cell.style.display = 'none';
                }
            });
        });
    }

    function saveConfig() {
        const config = columns.map((column, index) => {
            const th = table.querySelector(`th:nth-child(${index + 1})`);
            return {
                index: column.index,
                visible: column.visible,
                width: th.style.width || th.offsetWidth + 'px'
            };
        });
        localStorage.setItem('my-datatable-config:/business/order:task-table', JSON.stringify(config));
    }

    function loadConfig() {
        const savedConfig = localStorage.getItem('my-datatable-config:/business/order:task-table');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            columns = columns.map((column, index) => {
                const savedColumn = config.find(c => c.index === index);
                if (savedColumn) {
                    column.visible = savedColumn.visible;
                    column.width = savedColumn.width;
                }
                return column;
            });
        }
    }

    function applyColumnWidths() {
        columns.forEach((column, index) => {
            if (column.width) {
                const cells = table.querySelectorAll(`tr > *:nth-child(${index + 1})`);
                cells.forEach(cell => {
                    cell.style.width = column.width;
                });
            }
        });
    }
});