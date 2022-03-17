const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');//dotenv는 최대히 위에 COOKIE SECREAT 쿠키서명용
const passport = require('passport');
const helmet = require('helmet'); //운영 보안
const hpp = require('hpp');//운영 보안
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

dotenv.config();
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD,
});

const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const { sequelize } = require('./models');
const passportConfig = require('./passport');
const logger = require('./logger');

const app = express();
app.set('port', process.env.PORT || 8001);//나중에는 80 443으로 배포할거임
app.set('view engine', 'html');//nunjucks 임시용
nunjucks.configure('views', {
    express: app,
    watch: true,
});

sequelize.sync({ force: false }) //true면 테이블 지워졌다 다시생성 Data보관은 alter
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    });
passportConfig();


if(process.env.NODE_ENV === 'production') {
    app.enable('trust proxy');//프록시 세팅
    app.use(morgan('combined'));
    app.use(helmet( { contentSecurityPolicy: false }));//컨텐츠로딩할떄 에러나는경우가 있어서 false로
    app.use(hpp());
} else {
    app.use(morgan('dev'));
}
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads'))); //i
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser(process.env.COOKIE_SCREAT));

const sessionOption = {
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    store: new RedisStore({client: redisClient}), //redis에다가 세션정보 저장
    //싱글코어 오토스케일링?
};

if(process.env.NODE_ENV == 'production') {
    sessionOption.proxy = true;//프록시 쓰는경우
    //sessionOption.cookie.secure = true;
}

app.use(session(sessionOption));

//세션보다 아래에 있어야됨 등록해놓으면 req.user 하면 자동으로 시리얼 디시리얼 됨
app.use(passport.initialize());
app.use(passport.session());

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);
//모든라우터뒤에 404처리용 라우터
app.use((req, res, next) => {
    const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    logger.info('hello');
    logger.error(error.message);
    next(error);//error미들웨어로 넘겨줌
});


//에러처리 next 필수
app.use((err, req, res, next) => {
    res.locals.message = err.message;//템플릿엔진
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};//배포모드일때는 스택안보이게
    res.status(err.status || 500).render('error');
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), ' 번 포트 대기');
});