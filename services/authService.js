"use strict";

const { User } = require("../models");

const authService = {
  create: async (data) => {
    try {
      let result = await User.create(data);
      return result || false;
    } catch (err) {
      console.log("DB:error User create query Failed.", err);
      return false;
    }
  },

  findOne: async (param) => {
    try {
      let result = await User.unscoped().findOne(param);
      return result || false;
    } catch (err) {
      console.log("DB:error User findOne query Failed.", err);
      return false;
    }
  },

  update: async (data) => {
    try {
      let result = await User.update(data.values, {
        where: data.where,
      });
      return result || false;
    } catch (err) {
      console.log("DB:error User update query Failed.", err);
      return false;
    }
  }
};

module.exports = {
  ...authService,
};
