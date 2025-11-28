"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const config = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false } // 🔥 Supabase requires SSL
        },
        migrations: {
            directory: './src/migrations',
            extension: 'ts'
        },
        seeds: {
            directory: './src/seeds',
            extension: 'ts'
        },
        pool: {
            min: 2,
            max: 10
        }
    },
    production: {
        client: 'pg',
        connection: {
            connectionString: process.env.DATABASE_URL, // Supports full URL on Railway/Render
            ssl: { rejectUnauthorized: false } // 🔥 Must include SSL
        },
        migrations: {
            directory: './src/migrations'
        },
        seeds: {
            directory: './src/seeds'
        },
        pool: {
            min: 2,
            max: 10
        }
    }
};
exports.default = config;
//# sourceMappingURL=knexFile.js.map