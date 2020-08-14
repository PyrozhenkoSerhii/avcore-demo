module.exports = {
  "apps": [
    {
      "name": "avcore-demo-dev",
      "exec_mode": "fork",
      "instances": "1",
      "instance_var": "INSTANCE_ID",
      "script": "index.ts",
      "interpreter": "node",
      "watch": true,
      "ignore_watch": ["pm2", "node_modules", "dist"],
      "out_file": "./pm2/logs/dev/out.log",
      "error_file": "./pm2/logs/dev/error.log",
      "merge_logs": true,
      "combine_logs": true,
      "time": true
    }
  ]
};