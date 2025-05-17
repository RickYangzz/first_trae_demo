import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// Check for Gemini API Key
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables.');
  console.error('Please add GEMINI_API_KEY=YOUR_API_KEY to your .env file.');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Apply rate limiting to all requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter);

// 导入并使用路由
import apiRoutes from './routes/index';
app.use('/api', apiRoutes);

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});