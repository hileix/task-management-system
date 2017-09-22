'use strict'

const Auth = require('../../middlewares/auth');
const User = require('../../models/user');
const Output = require('../../middlewares/output');
const RBAC = require('../../middlewares/rbac');

const route = (app) => {
    /**
     * 首页
     */    
    app.get('/', (req, res) => {
        console.log('请求了首页')
        console.log(req._role)
        // 游客
        if(typeof req._role === 'string') {
            Output.render('user/index.art');
        }
        // 超级管理员
        if(RBAC.isSuperAdmin(req._role)) {
            Output.apiData('你是超级管理员哦~');
        }
        // 管理员
        if(RBAC.isAdmin(req._role)) {
            Output.apiData('你仅仅是管理员哦~');
        }
        Output.apiData('你是老师或学生');
        // if(!req._canVisit) {
        //     Output.apiErr({ code: 0, message: '你没有权限访问该资源' });
        // }
        // Output.apiData({}, '你有权限访问该资源');
       
    });
    /**
     * 用户登录
     */
    app.post('/login', (req, res) => {
        const username = req.body.username
        const password = req.body.password;

        User
        .getOne(username)
        .then((userData) => {
            // 在数据库中没有找到该用户
            if(!userData) {
                Output.apiErr({ code: 0, message: '用户名或密码错误' });
            }
            // 密码不正确
            if(userData.password !== password) {
                Output.apiErr({ code: 0, message: '用户名或密码错误' });
            }
            const token = Auth.generateToken(userData.user_id);
            // 将token放在cookie里
            Output.cookie('authorization', token, new Date(Date.now() + 30*24*60*60*1000));
            Output.apiData({ url: '/admin' }, '登录成功');
        })
        .catch((err) => {
            Output.apiErr(err);
        });
    });
};

module.exports = route;