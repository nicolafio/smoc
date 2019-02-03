/*
    
   JD342 intro 002
   Copyright (c) 2015 Nicola Fiori

   All rights reserved.

*/

function runIntro(ctx, callback) {
   var canvas = ctx.canvas;
   /*// Performance test
   var performance = -new Date().getTime();
   for (var ind = 0; ind < 1000000; ind++);
   performance += new Date().getTime();
   console.log(performance);*/
   // Draw JD logo
   var
      logo = document.createElement('canvas'),
      logoctx = logo.getContext('2d'),
      logoSize = logo.width = logo.height = 150,
      logoData,
      cv = [.103553390593274, .792893218813452, .292893218813453], //common values
      ind = 2
   ;
   for (; ind < 6; ind++) cv.push(cv[ind] + cv[0]);
   function drawLines() {
      var ind = arguments.length;
      while (2 + (ind -= 2))
         logoctx.lineTo(
            arguments[ind] * logoSize,
            arguments[ind + 1] * logoSize
         );
   }
   function drawArc(reversed) {
      logoctx.arc(
         cv[1] * logoSize,
         .5 * logoSize,
         cv[0] * logoSize * (reversed ? 1 : 2),
         Math.PI / 2 * (reversed ? 1 : -1),
         Math.PI / 2 * (reversed ? -1 : 1),
         reversed
      );
   }
   logoctx.beginPath();
   drawLines(
      cv[1], cv[2],
      .236323951119959, cv[2],
      .202677414904505, cv[3],
      .466353463784546, cv[3],
      .399060391353638, cv[5],
      .033646536215454, cv[5],
      0, cv[6],
      .474296333538801, cv[6],
      .580839276704234, cv[3],
      cv[1], cv[3]
   );
   drawArc();
   drawLines(
      cv[1], cv[5],
      .562384108954564, cv[5],
      .52873757273911, cv[6],
      cv[1], cv[6]
   );
   drawArc(true);
   logoctx.fillStyle = '#000';
   logoctx.fill();
   logoctx.closePath();
   logoIDD = logoctx.getImageData(0, 0, logoSize, logoSize).data; //logo ImageData data property
   // Setup particles
   var
      particles = new Array(),
      distance = 9, //distance between particles
      nopior = Math.floor(logoSize * 2.2 / distance), //maximum number of particles in one row
      margin = (logoSize - nopior * distance) / 2, //margins used to center the particles
      indx = nopior,
      indy, x, y
   ;
   while (indx--) {
      indy = nopior;
      while (indy--) {
         x = margin + indx * distance;
         y = margin + indy * distance;
         if (Math.pow(x - logoSize / 2, 2) + Math.pow(y - logoSize / 2, 2) < Math.pow(logoSize * 1.1, 2))
            particles.push([x, y]);
      }
   }
   // Lens filter animation
   var
      isIntroRunning = 1,
      radius = 0,
      maxRadius = logoSize * 1.5,
      fadeSize = logoSize,
      fadeRadius = maxRadius - fadeSize,
      animationSpeed = .0001 * logoSize,
      lensSd = 4.533333333333336,
      lensPx = 36 / 51,
      lensPy = 20 / 51,
      oldTime = 0, // new Date().getTime(),
      responseTime = 0
   ;
   function st(foo) {
      requestAnimationFrame(function() {
         var
            time = new Date().getTime(),
            responseTime = time - oldTime
         ;
         oldTime = time;
         foo(responseTime < 30 ? responseTime : 30);
      });
   }
   ctx.fillStyle = '#000';
   st(function frame(responseTime) {
      if (responseTime > 30) responseTime = 30;
      // lens radius computation
      radius += responseTime * animationSpeed;
      animationSpeed += responseTime * animationSpeed / 150;
      var
         maxdim = Math.round(radius < maxRadius ? radius : maxRadius) * 2 + 2,
         imageData = ctx.createImageData(
            maxdim < canvas.width ? maxdim : canvas.width,
            maxdim < canvas.height ? maxdim : canvas.height
         ),
         ox = imageData.width / 2,
         oy = imageData.height / 2,
         nIDD = imageData.data,
         cx, cy, nx, ny, sd0, sd1, a, b, c, d, m0, m1, b0, b1, d1, x, y, alpha
      ;
      indx = ox * 2;
      while (indx--) {
         indy = oy * 2;
         while (indy--) {
            if (maxdim >= (d1 = Math.sqrt(Math.pow(indx - ox, 2) + Math.pow(indy - oy, 2))) * 2) {
               // distortion
               if (d1 / radius < lensPx) {
                  cx = cy = sd0 = 0;
                  nx = lensPx;
                  ny = lensPy;
                  sd1 = lensSd;
               } else {
                  sd1 = 0;
                  nx = ny = 1;
                  cx = lensPx;
                  cy = lensPy;
                  sd0 = lensSd;
               }
               a = nx - cx;
               b = (d1 / radius - cx) / a;
               c = 1 - b;
               d = (c * cy + b * ny + (a * a / 6) * ((c * c * c - c) * sd0 + (b * b * b - b) * sd1)) * d1;
               x = indx + (ox - indx) * d / d1 - Math.floor(ox - logoSize / 2);
               if (x >= 0 && x < logoSize) {
                  y = indy + (oy - indy) * d / d1 - Math.floor(oy - logoSize / 2);
                  if (y >= 0 && y < logoSize) {
                     // anti-aliasing
                     a = x - Math.floor(x);
                     b = y - Math.floor(y);
                     c = Math.abs(a) - 1;
                     d = Math.abs(b) - 1;
                     b0 = a >= 0;
                     b1 = b >= 0;
                     m0 = b0 ? 4 : -4;
                     m1 = b1 ? logoSize * 4 : -logoSize * 4;
                     b0 = b0 ? x + 1 < logoSize : x - 1 >= 0;
                     b1 = b1 ? y + 1 < logoSize : y - 1 >= 0;
                     alpha = 4 * (Math.floor(x) + Math.floor(y) * logoSize) + 3;
                     alpha =
                        logoIDD[alpha] * Math.abs(c * d) +
                        (b0 ? logoIDD[alpha + m0] * Math.abs(a * d) : 0) +
                        (b1 ? logoIDD[alpha + m1] * Math.abs(c * b) : 0) +
                        (b0 && b1 ? logoIDD[alpha + m0 + m1] * Math.abs(a * b) : 0)
                     ;
                     if (d1 > maxdim / 2 - 1) alpha *= maxdim / 2 - d1;
                     // alpha = logoIDD[4 * (Math.floor(x) + Math.floor(y) * logoSize) + 3]; // no anti-aliasing
                     // fade
                     if (d1 > fadeRadius) alpha *= 1 - (d1 - fadeRadius) / fadeSize;
                     // output
                     nIDD[4 * (indx + indy * ox * 2) + 3] = alpha;
                  }
               }
            }
            ;
         }
      }
      nIDD[4 * Math.round(ox + oy * ox * 2) + 3] = 255;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, (canvas.width - ox * 2) / 2, (canvas.height - oy * 2) / 2);
      if (radius < maxRadius * 2) st(frame);
      else {
         // Particle animation
         // .316920338089615
         // .054441239200309
         animationSpeed = .003 * logoSize;
         x = .316920338089615 * logoSize;
         radius = 0;
         ctx.lineWidth = .054441239200309 * logoSize;
         ctx.strokeStyle = '#fff';
         ctx.fillStyle = 'rgba(0,0,0,.3)';
         st(function frame(responseTime) {
            radius += responseTime * animationSpeed;
            a = (logoSize - radius + x) / 2;
            if (a * 2 > logoSize)
               a = logoSize / 2;
            ox = (canvas.width - logoSize) / 2;
            oy = (canvas.height - logoSize) / 2;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(imageData, (canvas.width - imageData.width) / 2, (canvas.height - imageData.height) / 2);
            // transition
            if (radius < logoSize + x) {
               ctx.save();
               ctx.beginPath();
               ctx.moveTo(0, 0);
               ctx.lineTo(ox + radius, oy);
               ctx.lineTo(ox + radius - x, oy + logoSize);
               ctx.lineTo(0, canvas.height);
               ctx.clip();
               ctx.clearRect(0, 0, canvas.width, canvas.height);
               ctx.drawImage(logo, ox + a, oy + a, logoSize - a * 2, logoSize - a * 2);
               ctx.restore();
               ctx.closePath();
               ctx.beginPath();
               ctx.moveTo(ox + radius, oy);
               ctx.lineTo(ox + radius - x, oy + logoSize);
               ctx.stroke();
               ctx.closePath();
            }
            // particles
            a = particles.length;
            ctx.beginPath();
            while (a--) {
               b = particles[a];
               indx = b[0] + ox;
               indy = b[1] + oy;
               //d1 = Math.sqrt(Math.pow(indx - canvas.width / 2,2) + Math.pow(indy - canvas.height / 2, 2));
               alpha = 2 - Math.abs(Math.sqrt(Math.pow(indx - canvas.width / 2, 2) + Math.pow(indy - canvas.height / 2, 2)) - radius / 2.2) / x;
               if (alpha > 0) {
                  ctx.moveTo(indx, indy);
                  ctx.arc(
                     indx + (indx - canvas.width / 2) * alpha / 7,
                     indy + (indy - canvas.height / 2) * alpha / 7,
                     alpha * .7,
                     0,
                     6.283185307179586
                  );
               }
            }
            ctx.fill();
            ctx.closePath();
            if (radius < maxRadius * 3) st(frame);
            else if (callback) callback(function () {
               var 
                  canrun = false,
                  output = {}
               ;
               function frame() {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.putImageData(
                     imageData,
                     (canvas.width - imageData.width) / 2,
                     (canvas.height - imageData.height) / 2
                  );
                  if (canrun) st(frame);
               }
               Object.defineProperty(output, 'canrun', {
                  get: function () {
                     return canrun;
                  },
                  set: function (value) {
                     if (!value === canrun) {
                        canrun = !!value;
                        if (canrun) frame();
                     }
                     return value;
                  },
                  enumerable: true
               });
               output.canrun = true;
               return output;
            });
         });
      }
   });
}