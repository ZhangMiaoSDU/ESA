/**
 * Make predictions with trained filters / weights
*/
export function predict(image, f1, f2, w3, w4, b1, b2, b3, b4, conv_s = 1, pool_f = 2, pool_s = 2) {
let conv1 = this.convolution(image, f1, b1, conv_s); // convolution operation
conv1 = utils._reluActivation(conv1); // relu activation
// console.log("conv1: ", conv1)

let conv2 = this.convolution(conv1, f2, b2, conv_s); // second convolution operation
conv2 = utils._reluActivation(conv2); // pass through ReLU non-linearity
// console.log("conv2: ", conv2)

let pooled = this.maxpool(conv2, pool_f, pool_s); //maxpooling operation
// console.log("pooled: ", pooled)
let nf2 = pooled.length, dim2 = pooled[0].length;
let fc = utils._flatten(pooled); // flatten pooled layer
// console.log("fc: ", fc)
let z = utils._sum2M(utils._dot(w3, fc), b3); // first dense layer
z = utils._reluActivation(z);

let out = utils._sum2M(utils._dot(w4, z), b4) //secont dense layer

let probs = utils._sofmax(out);
// console.log("probs: ", probs)
return probs
}

export function /**
   * Confolves `filt` over `image` using stride `s` 
   */
  convolution(image, filt, bias, s = 1) {
  let n_f = filt.length, n_c_f = filt[0].length, f = filt[0][0].length;
  // console.log("n_f: ", n_f, " n_c_f: ", n_c_f, " f: ", f);
  let n_c = image.length, in_dim = image[0].length;
  // console.log("n_c: ", n_c, " in_dim: ", in_dim);
  let out_dim = parseInt((in_dim - f) / s) + 1;
  var out = utils._crearMatrix(n_f, out_dim, out_dim);
  // convolve the filter over every part of the image, adding the bias at each step
  for (let curr_f = 0; curr_f < n_f; curr_f++) {
    let curr_y = 0, out_y = 0;
    while (curr_y + f <= in_dim) {
      let curr_x = 0, out_x = 0;
      while (curr_x + f <= in_dim) {
        let _filt = filt[curr_f];
        let _img = utils._subImage(image, curr_y, curr_x, f);
        let _p = utils._product(_filt, _img);
        let _sum = utils._sum(_p);
        out[curr_f][out_y][out_x] = _sum + bias[curr_f][0];
        curr_x += s;
        out_x += 1;
      }
      curr_y += s;
      out_y += 1;
    }
  }
  return out
}

export function /**
   * Downsample `image` using kernel size `f` and stride `s`
   */
  maxpool(image, f = 2, s = 2) {
  let n_c = image.length, h_prev = image[0].length, w_prev = image[0][0].length;

  let h = parseInt((h_prev - f) / s) + 1;
  let w = parseInt((w_prev - f) / s) + 1;

  let downsampled = utils._crearMatrix(n_c, h, w);
  for (let i = 0; i < n_c; i++) {
    // slide maxpool window over each part of the image and assign the max value at each step to the output 
    let curr_y = 0, out_y = 0;
    while (curr_y + f <= h_prev) {
      let curr_x = 0, out_x = 0;
      while (curr_x + f <= w_prev) {
        let _img = utils._subMatrix(image[i], curr_y, curr_x, f)
        downsampled[i][out_y][out_x] = utils._maxMatrix(_img);
        curr_x += s;
        out_x += 1;
      }
      curr_y += s;
      out_y += 1;
    }
  }
}
