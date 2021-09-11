module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
  */
    return queryInterface.sequelize.transaction(async t => {
      try {
        const chargeColumn = await queryInterface.addColumn(
          "products",
          "charge",
          {
            type: Sequelize.FLOAT,
            defaultValue:0,
            allowNull: true
          },
          {
            transaction: t
          }
        );
        

        return Promise.all(chargeColumn);
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
    const chargeColumn = await queryInterface.removeColumn(
      "products",
      "charge",
      {}
    );
    return Promise.all(chargeColumn);
  }
};
