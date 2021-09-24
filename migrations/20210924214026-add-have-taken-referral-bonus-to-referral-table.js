module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
  */
    return queryInterface.sequelize.transaction(async t => {
      try {
        const bonusColumn = await queryInterface.addColumn(
          "referrals",
          "haveCollectedBonus",
          {
            type: Sequelize.BOOLEAN,
            defaultValue:false,
            allowNull: true
          },
          {
            transaction: t
          }
        );
        

        return Promise.all(bonusColumn);
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
    const bonusColumn = await queryInterface.removeColumn(
      "referrals",
      "haveCollectedBonus",
      {}
    );
    return Promise.all(bonusColumn);
  }
};
