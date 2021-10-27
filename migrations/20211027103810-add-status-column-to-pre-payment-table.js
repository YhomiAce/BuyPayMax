module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.
  */
    return queryInterface.sequelize.transaction(async t => {
      try {
        const statusColumn = await queryInterface.addColumn(
          "pre_payment_logs",
          "status",
          {
            type: Sequelize.ENUM("pending", "approved", "disapproved"),
            defaultValue: "pending"
          },
          {
            transaction: t
          }
        );
        

        return Promise.all(statusColumn);
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
    const statusColumn = await queryInterface.removeColumn(
      "pre_payment_logs",
      "maxWithdrawal",
      {}
    );
    return Promise.all(statusColumn);
  }
};
