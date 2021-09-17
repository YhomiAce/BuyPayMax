module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
  */
    return queryInterface.sequelize.transaction(async t => {
      try {
        const weeklyEarningColumn = await queryInterface.addColumn(
          "Investments",
          "weeklyEarning",
          {
            type: Sequelize.FLOAT,
            defaultValue:0,
            allowNull: true
          },
          {
            transaction: t
          }
        );
        

        return Promise.all(weeklyEarningColumn);
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
    const weeklyEarningColumn = await queryInterface.removeColumn(
      "Investments",
      "weeklyEarning",
      {}
    );
    return Promise.all(weeklyEarningColumn);
  }
};
