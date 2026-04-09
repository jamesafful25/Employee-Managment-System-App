const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

//PDF Generator
const generatePDF = (title, columns, rows, res) => {
    const doc = new PDFDocument({ margin: 30 });

    // pipe directly to response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);
    doc.pipe(res);

    // title
    doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // table headers
    const colWidth = (doc.page.width - 60) / columns.length;
    let x = 30;
    const headerY = doc.y;

    doc.fontSize(10).font('Helvetica-Bold');
    columns.forEach((col) => {
        doc.text(col, x, headerY, { width: colWidth, align: 'left' });
        x += colWidth;
    });

    doc.moveDown();
    doc.moveTo(30, doc.y).lineTo(doc.page.width - 30, doc.y).stroke();
    doc.moveDown(0.5);

    // table rows
    doc.fontSize(9).font('Helvetica');
    rows.forEach((row) => {
        x = 30;
        const rowY = doc.y;
        row.forEach((cell) => {
            //doc.text(String(cell ? ? '-'), x, rowY, { width: colWidth, align: 'left' });
            doc.text(String(cell !== undefined && cell !== null ? cell : '-'), x, rowY, { width: colWidth, align: 'left' });
            x += colWidth;
        });
        doc.moveDown(0.5);

        // add new page if running out of space
        if (doc.y > doc.page.height - 100) doc.addPage();
    });

    doc.end();
};

// Excel Generator 
const generateExcel = async(title, columns, rows, res) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(title);

    // set column headers and widths
    sheet.columns = columns.map((col) => ({
        header: col,
        key: col,
        width: 20,
    }));

    // style header row
    sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D6A4F' } };
        cell.alignment = { horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        };
    });

    // add rows
    rows.forEach((row, index) => {
        const rowData = {};
        columns.forEach((col, i) => {
            //rowData[col] = row[i] ? ? '-';
            rowData[col] = (row[i] !== undefined && row[i] !== null) ? row[i] : '-';
        });
        const addedRow = sheet.addRow(rowData);

        // alternate row color
        if (index % 2 === 0) {
            addedRow.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
            });
        }
    });

    // pipe to response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
};

module.exports = { generatePDF, generateExcel };