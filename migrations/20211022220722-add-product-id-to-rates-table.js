module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
  */
    return queryInterface.sequelize.transaction(async t => {
      try {
        const productIdColumn = await queryInterface.addColumn(
          "rates",
          "productId",
          {
            type: Sequelize.STRING,
            allowNull: true
          },
          {
            transaction: t
          }
        );
        

        return Promise.all(productIdColumn);
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
    const productIdColumn = await queryInterface.removeColumn(
      "rates",
      "productId",
      {}
    );
    return Promise.all(productIdColumn);
  }
};
