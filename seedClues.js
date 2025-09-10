require('dotenv').config();
const Clue = require('./models/Clue');

const seedClues = async () => {
  try {
    console.log("🌱 Seeding clues...");

    const clues = [
      { blockNumber: 1, code: "14", coordinates: "12.915419,74.827882", verificationCode: "44" },
      { blockNumber: 2, code: "10", coordinates: "12.915776,74.828980", verificationCode: "29" },
      { blockNumber: 3, code: "14", coordinates: "12.915741,74.829236", verificationCode: "56" },
      { blockNumber: 4, code: "7", coordinates: "12.914941,74.828763", verificationCode: "94" },
      { blockNumber: 5, code: "12", coordinates: "12.916170,74.829698", verificationCode: "18" },
      { blockNumber: 6, code: "7", coordinates: "12.916383,74.830786", verificationCode: "69" },
      { blockNumber: 7, code: "12", coordinates: "12.915485,74.829656", verificationCode: "32" },
      { blockNumber: 8, code: "7", coordinates: "12.915420,74.830315", verificationCode: "77" },
      { blockNumber: 9, code: "11", coordinates: "12.915456,74.829951", verificationCode: "89" },
      { blockNumber: 10, code: "7", coordinates: "12.915158,74.829434", verificationCode: "99" }
    ];

    for (const clue of clues) {
      const existing = await Clue.findOne({ blockNumber: clue.blockNumber });
      if (!existing) {
        await Clue.create(clue);
        console.log(`✅ Clue for block ${clue.blockNumber} inserted`);
      }
    }

    console.log("🌟 Clues seeding completed (nothing was deleted).");
  } catch (err) {
    console.error("❌ Error seeding clues:", err);
  }
};

module.exports = seedClues;
