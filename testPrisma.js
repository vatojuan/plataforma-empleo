const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testInsert() {
  try {
    const newDocument = await prisma.employeeDocument.create({
      data: {
        fileKey: "test-document.pdf",
        originalName: "Test Document",
        userId: 3,
        url: "", // Debe coincidir con el esquema de Prisma
      },
    });

    console.log("✅ Documento insertado correctamente:", newDocument);
  } catch (error) {
    console.error("❌ Error insertando documento en Prisma:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testInsert();
