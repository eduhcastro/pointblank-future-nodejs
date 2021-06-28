"use strict";

class presetsConfig{
  domain = process.env.DOMAIN || 'http://localhost:8080'
}

module.exports={
  Config: presetsConfig
}