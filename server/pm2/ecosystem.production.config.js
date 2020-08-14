module.exports = {
  "apps": [
    {
      "name": "avcore-demo-prod",
      "exec_mode": "cluster",
      "instances": "max",
      "instance_var": "INSTANCE_ID",
      "script": "./dist/index.js",
      "interpreter": "node",
      "watch": false,
      "out_file": "./pm2/logs/prod/out.log",
      "error_file": "./pm2/logs/prod/error.log",
      "merge_logs": true,
      "combine_logs": true,
    }
  ]
};