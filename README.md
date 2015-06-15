# 这是nodejs编写的一个漂流瓶,数据库使用mongodb，缓存数据库redis

### 数据库设计
>* users
    name: String
    password: String
    email: String
    sex: Number *0 present male; 1 present female*
    createtime: Date
>* bottle
    fromuser: String *存储用户_id*
    touser: String *存储用户_id*
    content: String
    messages: Array *存储聊天信息*
    createtime: Date
    picktime: Date

### redis 设计
>* 索引
    0 用来存储 漂流瓶
    1 用来存储 所有用户今天扔出次数,EXPIRE: 当天
    2 用来存储 所有用户今天捡瓶子的次数,EXPIRE: 当天

### 功能设计
  >* 用户注册/登录/登出
  >* 扔漂流瓶/捡漂流瓶
  >* 回复漂流瓶
