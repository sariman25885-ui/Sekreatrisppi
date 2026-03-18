import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";

export const exportToDocx = async (roomName: string, date: string, findings: string) => {
  const findingsParagraphs = findings.split('\n').map(line => {
    return new Paragraph({
      children: [new TextRun({ text: line, size: 24 })],
      spacing: { after: 120 }
    });
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({ text: "HASIL TEMUAN SUPERVISI IPCN", bold: true, size: 28 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new Paragraph({
          children: [new TextRun({ text: `Nama Ruang : ${roomName}`, bold: true, size: 24 })],
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: `Tanggal    : ${date}`, bold: true, size: 24 })],
          spacing: { after: 400 }
        }),
        ...findingsParagraphs
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const safeRoomName = roomName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${safeRoomName}_${date}.docx`;
  
  saveAs(blob, fileName);
};
