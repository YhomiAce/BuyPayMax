module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
  */
    return queryInterface.sequelize.transaction(async t => {
      try {
        const imageColumn = await queryInterface.addColumn(
          "gift_cards",
          "image",
          {
            type: Sequelize.STRING,
            allowNull: true
          },
          {
            transaction: t
          }
        );
        

        return Promise.all(imageColumn);
      } catch (error) {
        return t.rollback();
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
    */
    const imageColumn = await queryInterface.removeColumn(
      "gift_cards",
      "image",
      {}
    );
    return Promise.all(imageColumn);
  }
};
