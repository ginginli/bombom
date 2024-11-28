class StockAPI {
    async fetchStockData(symbol) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const days = 250; // 修改为250天，符合《笑傲牛熊》的分析周期
        const data = [];
        let price = 100 + Math.random() * 50;
        let trend = Math.random() > 0.5 ? 1 : -1;
        
        for (let i = 0; i < days; i++) {
            // 每50天可能改变一次趋势
            if (i % 50 === 0) trend = Math.random() > 0.5 ? 1 : -1;
            price = price * (1 + trend * (Math.random() * 0.03));
            
            const volume = Math.floor(Math.random() * 1000000) * (1 + trend * Math.random());
            
            data.push({
                date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                price: price.toFixed(2),
                volume: Math.floor(volume),
                high: (price * (1 + Math.random() * 0.02)).toFixed(2),
                low: (price * (1 - Math.random() * 0.02)).toFixed(2),
                open: (price * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2),
                close: price.toFixed(2)
            });
        }
        
        return data;
    }
}

class ChartManager {
    constructor() {
        this.priceChart = echarts.init(document.getElementById('priceChart'));
        this.volumeChart = echarts.init(document.getElementById('volumeChart'));
        this.currentPeriod = 250;
        this.fullData = [];
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.priceChart.resize();
            this.volumeChart.resize();
        });
    }

    setData(data) {
        this.fullData = data;
        const periodData = this.getCurrentPeriodData();
        this.renderPriceChart(periodData);
        this.renderVolumeChart(periodData);
    }

    getCurrentPeriodData() {
        return this.fullData.slice(-this.currentPeriod);
    }

    changePeriod(period) {
        this.currentPeriod = period;
        const periodData = this.getCurrentPeriodData();
        this.renderPriceChart(periodData);
        this.renderVolumeChart(periodData);
    }

    renderPriceChart(data) {
        const option = {
            title: { 
                text: `价格走势图 (${this.currentPeriod}天)`,
                left: 'center',
                top: 10,
                textStyle: {
                    fontSize: 16
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
            },
            legend: {
                data: ['K线', 'MA5', 'MA10', 'MA20', 'MA60', 'MA250'],
                top: 40,
                selected: {
                    'MA250': this.currentPeriod === 250 // 仅在250天周期显示年线
                }
            },
            grid: {
                left: '3%',
                right: '3%',
                top: '15%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.date)
            },
            yAxis: {
                type: 'value',
                scale: true
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100
                },
                {
                    show: true,
                    type: 'slider',
                    bottom: 5
                }
            ],
            series: [
                {
                    name: 'K线',
                    type: 'candlestick',
                    data: data.map(item => [
                        item.open,
                        item.close,
                        item.low,
                        item.high
                    ])
                },
                {
                    name: 'MA5',
                    type: 'line',
                    smooth: true,
                    data: this.calculateMA(5, data)
                },
                {
                    name: 'MA10',
                    type: 'line',
                    smooth: true,
                    data: this.calculateMA(10, data)
                },
                {
                    name: 'MA20',
                    type: 'line',
                    smooth: true,
                    data: this.calculateMA(20, data)
                },
                {
                    name: 'MA60',
                    type: 'line',
                    smooth: true,
                    data: this.calculateMA(60, data)
                },
                {
                    name: 'MA250',
                    type: 'line',
                    smooth: true,
                    data: this.calculateMA(250, data)
                }
            ]
        };
        
        this.priceChart.setOption(option, true);
    }

    renderVolumeChart(data) {
        const option = {
            title: { 
                text: `成交量 (${this.currentPeriod}天)`,
                left: 'center',
                top: 10,
                textStyle: {
                    fontSize: 16
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
            },
            legend: {
                data: ['成交量', '成交量MA5', '成交量MA10'],
                top: 40
            },
            grid: {
                left: '3%',
                right: '3%',
                top: '15%',
                bottom: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.date)
            },
            yAxis: {
                type: 'value'
            },
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100
                },
                {
                    show: true,
                    type: 'slider',
                    bottom: 5
                }
            ],
            series: [
                {
                    name: '成交量',
                    type: 'bar',
                    data: data.map(item => item.volume)
                },
                {
                    name: '成交量MA5',
                    type: 'line',
                    smooth: true,
                    data: this.calculateMA(5, data.map(item => ({close: item.volume})))
                },
                {
                    name: '成交量MA10',
                    type: 'line',
                    smooth: true,
                    data: this.calculateMA(10, data.map(item => ({close: item.volume})))
                }
            ]
        };
        
        this.volumeChart.setOption(option, true);
    }

    calculateMA(dayCount, data) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < dayCount - 1) {
                result.push('-');
                continue;
            }
            let sum = 0;
            for (let j = 0; j < dayCount; j++) {
                sum += parseFloat(data[i - j].close);
            }
            result.push((sum / dayCount).toFixed(2));
        }
        return result;
    }
}

class StockAnalyzer {
    analyze(data) {
        const technicalAnalysis = this.analyzeTechnicalIndicators(data);
        const trendAnalysis = this.analyzeTrend(data);
        const volumeAnalysis = this.analyzeVolume(data);
        const finalAdvice = this.generateFinalAdvice(technicalAnalysis, trendAnalysis, volumeAnalysis);
        
        return {
            technicalAnalysis,
            trendAnalysis,
            volumeAnalysis,
            finalAdvice
        };
    }

    analyzeTechnicalIndicators(data) {
        const prices = data.map(item => parseFloat(item.close));
        const ma5 = this.calculateMA(prices.slice(-5));
        const ma10 = this.calculateMA(prices.slice(-10));
        const ma20 = this.calculateMA(prices.slice(-20));
        const ma60 = this.calculateMA(prices.slice(-60));
        
        let analysis = "技术指标分析：\n\n";
        
        // 均线系统分析
        analysis += "1. 均线系统：\n";
        if (ma5 > ma10 && ma10 > ma20 && ma20 > ma60) {
            analysis += "- 多头排列，强势上涨趋势\n";
        } else if (ma5 < ma10 && ma10 < ma20 && ma20 < ma60) {
            analysis += "- 空头排列，强势下跌趋势\n";
        } else {
            analysis += "- 均线交叉，趋势转换阶段\n";
        }
        
        // 价格位置分析
        const lastPrice = prices[prices.length - 1];
        analysis += "\n2. 价格位置：\n";
        if (lastPrice > ma5) {
            analysis += "- 价格位于5日均线上方，短期走强\n";
        } else {
            analysis += "- 价格位于5日均线下方，短期走弱\n";
        }
        
        return analysis;
    }

    analyzeTrend(data) {
        let analysis = "趋势分析：\n\n";
        
        // 计算最近的高点和低点
        const prices = data.map(item => parseFloat(item.high));
        const lows = data.map(item => parseFloat(item.low));
        
        // 分析最近20天的趋势
        const recentPrices = prices.slice(-20);
        const priceChange = (recentPrices[recentPrices.length-1] - recentPrices[0]) / recentPrices[0] * 100;
        
        analysis += "1. 趋势特征：\n";
        if (priceChange > 5) {
            analysis += "- 上升趋势，20天涨幅" + priceChange.toFixed(2) + "%\n";
        } else if (priceChange < -5) {
            analysis += "- 下降趋势，20天跌幅" + Math.abs(priceChange).toFixed(2) + "%\n";
        } else {
            analysis += "- 横盘整理，波动幅度较小\n";
        }
        
        // 支撑位和压力位分析
        analysis += "\n2. 支撑与压力：\n";
        const support = Math.min(...lows.slice(-20));
        const resistance = Math.max(...prices.slice(-20));
        analysis += `- 近期支撑位：${support.toFixed(2)}\n`;
        analysis += `- 近期压力位：${resistance.toFixed(2)}\n`;
        
        return analysis;
    }

    analyzeVolume(data) {
        let analysis = "量价分析：\n\n";
        
        // 计算最近5天的平均成交量
        const volumes = data.map(item => parseInt(item.volume));
        const recentVolumes = volumes.slice(-5);
        const avgVolume = this.calculateMA(recentVolumes);
        
        // 计算之前5天的平均成交量
        const previousVolumes = volumes.slice(-10, -5);
        const previousAvgVolume = this.calculateMA(previousVolumes);
        
        analysis += "1. 成交量变化：\n";
        if (avgVolume > previousAvgVolume * 1.2) {
            analysis += "- 成交量明显放大，说明交投活跃\n";
        } else if (avgVolume < previousAvgVolume * 0.8) {
            analysis += "- 成交量明显萎缩，说明交投清淡\n";
        } else {
            analysis += "- 成交量基本平稳\n";
        }
        
        // 量价配合分析
        const prices = data.map(item => parseFloat(item.close));
        const priceChange = (prices[prices.length-1] - prices[prices.length-6]) / prices[prices.length-6] * 100;
        
        analysis += "\n2. 量价关系：\n";
        if (priceChange > 0 && avgVolume > previousAvgVolume) {
            analysis += "- 价升量增，走势强劲\n";
        } else if (priceChange < 0 && avgVolume > previousAvgVolume) {
            analysis += "- 价跌量增，卖压较大\n";
        } else if (priceChange > 0 && avgVolume < previousAvgVolume) {
            analysis += "- 价升量减，上涨动能不足\n";
        } else {
            analysis += "- 价跌量减，跌势趋缓\n";
        }
        
        return analysis;
    }

    generateFinalAdvice(technical, trend, volume) {
        let advice = "综合建议：\n\n";
        
        // 提取关键信息
        const isTechnicalBullish = technical.includes("多头排列");
        const isTrendUp = trend.includes("上升趋势");
        const isVolumeStrong = volume.includes("成交量明显放大");
        
        // 计算看多和看空的因素
        let bullishFactors = 0;
        let bearishFactors = 0;
        
        if (isTechnicalBullish) bullishFactors++;
        if (isTrendUp) bullishFactors++;
        if (isVolumeStrong) bullishFactors++;
        
        // 根据《笑傲牛熊》的交易法则给出建议
        if (bullishFactors >= 2) {
            advice += "1. 市场特征：多头市场特征明显\n";
            advice += "2. 操作建议：可以考虑逢低买入，持股待涨\n";
            advice += "3. 风险控制：设置止损位，建议在最近支撑位下方\n";
        } else if (bearishFactors >= 2) {
            advice += "1. 市场特征：空头市场特征明显\n";
            advice += "2. 操作建议：可以考虑减持或观望\n";
            advice += "3. 风险控制：如持股，建议严格设置止损\n";
        } else {
            advice += "1. 市场特征：市场特征不明确\n";
            advice += "2. 操作建议：建议观望为主\n";
            advice += "3. 风险控制：暂时避免建立新仓位\n";
        }
        
        return advice;
    }

    calculateMA(prices) {
        return prices.reduce((sum, price) => sum + price, 0) / prices.length;
    }

    analyzeMarketCharacter(data) {
        // 1. 均线系统判断
        const prices = data.map(item => parseFloat(item.close));
        const ma5 = this.calculateMA(prices.slice(-5));
        const ma10 = this.calculateMA(prices.slice(-10));
        const ma20 = this.calculateMA(prices.slice(-20));
        const ma60 = this.calculateMA(prices.slice(-60));
        
        // 2. 成交量分析
        const volumes = data.map(item => parseInt(item.volume));
        const recentVolumeMA5 = this.calculateMA(volumes.slice(-5));
        const previousVolumeMA5 = this.calculateMA(volumes.slice(-10, -5));
        const isVolumeIncreasing = recentVolumeMA5 > previousVolumeMA5 * 1.3;
        const isVolumeDecreasing = recentVolumeMA5 < previousVolumeMA5 * 0.7;

        // 3. 趋势判断
        const priceChange = ((prices[prices.length-1] - prices[prices.length-21]) / prices[prices.length-21]) * 100;
        
        // 多头市场需同时满足三个条件
        const isBullish = 
            // 条件1: 均线多头排列
            (ma5 > ma10 && ma10 > ma20 && ma20 > ma60) &&
            // 条件2: 价格在主要均线上方
            (prices[prices.length-1] > ma20) &&
            // 条件3: 成交量配合（放大）且涨幅明显
            (isVolumeIncreasing && priceChange > 8);
        
        // 空头市场需同时满足三个条件
        const isBearish = 
            // 条件1: 均线空头排列
            (ma5 < ma10 && ma10 < ma20 && ma20 < ma60) &&
            // 条件2: 价格在主要均线下方
            (prices[prices.length-1] < ma20) &&
            // 条件3: 成交量配合（放大）且跌幅明显
            (isVolumeIncreasing && priceChange < -8);
        
        return {
            isBullish,
            isBearish,
            isUnclear: !isBullish && !isBearish,
            details: {
                maAlignment: ma5 > ma10 && ma10 > ma20 && ma20 > ma60 ? "多头排列" : 
                            ma5 < ma10 && ma10 < ma20 && ma20 < ma60 ? "空头排列" : "均线交叉",
                pricePosition: prices[prices.length-1] > ma20 ? "价格在均线上方" : "价格在均线下方",
                volumeStatus: isVolumeIncreasing ? "量能放大" : 
                             isVolumeDecreasing ? "量能萎缩" : "量能平稳",
                trendStrength: `${Math.abs(priceChange).toFixed(2)}%${priceChange > 0 ? '上涨' : '下跌'}`
            }
        };
    }
}

class StockController {
    constructor() {
        this.api = new StockAPI();
        this.chartManager = new ChartManager();
        this.analyzer = new StockAnalyzer();
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
    }
    
    showLoading() {
        this.loading.style.display = 'block';
    }
    
    hideLoading() {
        this.loading.style.display = 'none';
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
    }
    
    hideError() {
        this.errorMessage.style.display = 'none';
    }
    
    async analyzeStock(symbol) {
        try {
            this.hideError();
            this.showLoading();
            
            const data = await this.api.fetchStockData(symbol);
            this.chartManager.setData(data); // 使用新的setData方法
            
            const analysis = this.analyzer.analyze(data);
            
            document.getElementById('technicalAnalysis').value = analysis.technicalAnalysis;
            document.getElementById('trendAnalysis').value = analysis.trendAnalysis;
            document.getElementById('volumeAnalysis').value = analysis.volumeAnalysis;
            document.getElementById('finalAdvice').value = analysis.finalAdvice;
            
        } catch (error) {
            this.showError(`处理出错：${error.message}`);
        } finally {
            this.hideLoading();
        }
    }
}

const controller = new StockController();

function analyzeStock() {
    const stockCode = document.getElementById('stockCode').value;
    if (!stockCode) {
        controller.showError('请输入股票代码');
        return;
    }
    controller.analyzeStock(stockCode);
}

function changePeriod() {
    const period = parseInt(document.getElementById('periodSelector').value);
    controller.chartManager.changePeriod(period);
} 