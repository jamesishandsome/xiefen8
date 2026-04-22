import * as XLSX from 'xlsx';

export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const players = jsonData
          .filter(row => row['游戏内名字'] || row['姓名'] || row['名字'])
          .map((row, index) => {
            const pos1 = row['pos1'] || '';
            const pos2 = row['pos2'] || '';
            const pos3 = row['pos3'] || '';
            const pos4 = row['pos4'] || '';
            const pos5 = row['pos5'] || '';

            let positions = [];
            let mainPositions = [];
            if (pos1 === '✔' || pos1 === '★') positions.push('1');
            if (pos2 === '✔' || pos2 === '★') positions.push('2');
            if (pos3 === '✔' || pos3 === '★') positions.push('3');
            if (pos4 === '✔' || pos4 === '★') positions.push('4');
            if (pos5 === '✔' || pos5 === '★') positions.push('5');

            if (pos1 === '★') mainPositions.push('1');
            if (pos2 === '★') mainPositions.push('2');
            if (pos3 === '★') mainPositions.push('3');
            if (pos4 === '★') mainPositions.push('4');
            if (pos5 === '★') mainPositions.push('5');

            let positionStr = positions.length > 0 ? positions.join('/') + '号位' : '全能';
            let mainPositionStr = mainPositions.length > 0 ? mainPositions.join('/') + '号位' : '';

            return {
              id: row['编号'] || index + 1,
              name: row['游戏内名字'] || row['姓名'] || row['名字'] || row['选手'] || `选手${index + 1}`,
              mmr: row['自爆分数'] || row['MMR'] || row['分数'] || 0,
              tier: row['挡位'] || '',
              startPrice: row['起拍价'] || 0,
              position: positionStr,
              mainPosition: mainPositionStr,
              positions: positions,
              primaryPosition: mainPositions[0] || positions[0] || '1',
              selfRating: row['自评'] || 0,
              positionCode: row['位置'] || 0,
              pos1: pos1,
              pos2: pos2,
              pos3: pos3,
              pos4: pos4,
              pos5: pos5,
              team: null,
              auctionPrice: null
            };
          });

        resolve(players);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const loadDefaultExcel = async () => {
  try {
    const response = await fetch('/第八届下分杯选手池.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

    const players = jsonData
      .filter(row => row['游戏内名字'] || row['姓名'] || row['名字'])
      .map((row, index) => {
        const pos1 = row['pos1'] || '';
        const pos2 = row['pos2'] || '';
        const pos3 = row['pos3'] || '';
        const pos4 = row['pos4'] || '';
        const pos5 = row['pos5'] || '';

        let positions = [];
        let mainPositions = [];
        if (pos1 === '✔' || pos1 === '★') positions.push('1');
        if (pos2 === '✔' || pos2 === '★') positions.push('2');
        if (pos3 === '✔' || pos3 === '★') positions.push('3');
        if (pos4 === '✔' || pos4 === '★') positions.push('4');
        if (pos5 === '✔' || pos5 === '★') positions.push('5');

        if (pos1 === '★') mainPositions.push('1');
        if (pos2 === '★') mainPositions.push('2');
        if (pos3 === '★') mainPositions.push('3');
        if (pos4 === '★') mainPositions.push('4');
        if (pos5 === '★') mainPositions.push('5');

        let positionStr = positions.length > 0 ? positions.join('/') + '号位' : '全能';
        let mainPositionStr = mainPositions.length > 0 ? mainPositions.join('/') + '号位' : '';

        return {
          id: row['编号'] || index + 1,
          name: row['游戏内名字'] || row['姓名'] || row['名字'] || row['选手'] || `选手${index + 1}`,
          mmr: row['自爆分数'] || row['MMR'] || row['分数'] || 0,
          tier: row['挡位'] || '',
          startPrice: row['起拍价'] || 0,
          position: positionStr,
          mainPosition: mainPositionStr,
          positions: positions,
          primaryPosition: mainPositions[0] || positions[0] || '1',
          selfRating: row['自评'] || 0,
          positionCode: row['位置'] || 0,
          pos1: pos1,
          pos2: pos2,
          pos3: pos3,
          pos4: pos4,
          pos5: pos5,
          team: null,
          auctionPrice: null
        };
      });

    return players;
  } catch (error) {
    console.error('Failed to load default Excel:', error);
    return [];
  }
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const formatCurrency = (amount) => {
  return `¥${amount.toLocaleString()}`;
};
