import * as PIXI from 'pixi.js';
import { GoslingTrackModel } from '../gosling-track-model';
import { SingleTrack } from '../gosling.schema';
import { drawLinearYAxis } from './axis';

describe('Y Axis', () => {
    const g = new PIXI.Graphics();
    it('Linear', () => {
        const t: SingleTrack = {
            data: { type: 'csv', url: '' },
            mark: 'line',
            x: { field: 'x', type: 'genomic' },
            y: { field: 'y', type: 'quantitative' },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, y: 2 },
            { x: 11, y: 22 },
            { x: 111, y: 222 }
        ];
        const model = new GoslingTrackModel(t, d);
        drawLinearYAxis(
            {
                libraries: {
                    PIXI: {
                        Text: PIXI.Text
                    }
                }
            },
            {
                dimensions: [100, 400],
                position: [0, 0],
                pBorder: g
            },
            null,
            model
        );
    });

    it('Circular', () => {
        const t: SingleTrack = {
            layout: 'circular',
            startAngle: 0,
            endAngle: 240,
            innerRadius: 10,
            outerRadius: 40,
            data: { type: 'csv', url: '' },
            mark: 'line',
            x: { field: 'x', type: 'genomic' },
            y: { field: 'y', type: 'quantitative', axis: 'right' },
            width: 100,
            height: 100
        };
        const d = [
            { x: 1, y: 2 },
            { x: 11, y: 22 },
            { x: 111, y: 222 }
        ];
        const model = new GoslingTrackModel(t, d);
        drawLinearYAxis(
            {
                libraries: {
                    PIXI: {
                        Text: PIXI.Text
                    }
                }
            },
            {
                dimensions: [100, 400],
                position: [0, 0],
                pBorder: g
            },
            null,
            model
        );
    });
});
