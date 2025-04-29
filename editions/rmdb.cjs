if(require("fs").existsSync(__dirname + "/mws/store/database.sqlite"))
  require("fs").rmSync(__dirname + "/mws/store/database.sqlite");