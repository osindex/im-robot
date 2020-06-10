const DB = require('./db');
return DB.migrate.latest()
	.then(function() {
    if (process.env.NODE_ENV !== 'production') {
      // 非生产环境才执行
      return DB.seed.run();
    }
	})
	.then(function() {
    // migrations are finished
    // 关闭进程
		process.exit(0)
  })
  .catch(err=>{
  	return err
  })
