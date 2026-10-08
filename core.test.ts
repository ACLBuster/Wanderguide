import {test} from 'node:test';
import assert from 'node:assert/strict';
import {approximate,distanceMeters} from '../src/lib/geo';
import {requestSchema} from '../src/lib/types';
import {isSupportedImageData} from '../src/lib/image-validation';
test('Device coordinates are rounded before leaving the browser',()=>{assert.deepEqual(approximate({latitude:1.352083,longitude:103.819836}),{lat:1.35,lng:103.82});});
test('Distance works across the international date line',()=>{const d=distanceMeters({lat:0,lng:179.999},{lat:0,lng:-179.999});assert.ok(d>200&&d<230);assert.equal(distanceMeters({lat:10,lng:20},{lat:10,lng:20}),0);});
test('Requests reject arbitrary image URLs, excessive history, and out of range locations',()=>{const base={action:'identify',mode:'Highlights',image:'data:image/jpeg;base64,/9j/AAAAAAAAAAAA'};assert.ok(requestSchema.safeParse(base).success);assert.equal(requestSchema.safeParse({...base,image:'https://example.com/private'}).success,false);assert.equal(requestSchema.safeParse({...base,location:{lat:91,lng:0}}).success,false);assert.equal(requestSchema.safeParse({...base,messages:Array(31).fill({role:'user',content:'test'})}).success,false);});
test('Image bytes must match the declared format',()=>{assert.equal(isSupportedImageData('data:image/jpeg;base64,'+Buffer.from('this is not an image').toString('base64')),false);const bytes=Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0]);assert.equal(isSupportedImageData('data:image/png;base64,'+bytes.toString('base64')),true);assert.equal(isSupportedImageData('data:image/jpeg;base64,'+bytes.toString('base64')),false);});
