module.exports = {
  "apps": [
    {
      "name": "web",
      "exec_mode": "cluster",
      "instances": "max",
      "script": "./index.ts",
      "interpreter": "ts-node"
    }
  ]
};