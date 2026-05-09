# （I）直接求交点坐标

当 \(a=-1,b=2,c=3\) 时，

\[
y=-x^2+2x+3=-(x-3)(x+1).
\]

所以抛物线与 \(x\) 轴的交点为 \((-1,0)\)、\((3,0)\)。因为点 \(A\) 在点 \(B\) 左侧，

\[
A(-1,0),\quad B(3,0).
\]

令 \(x=0\)，得

\[
C(0,3).
\]

# （II）① 由根与旋转求 \(a\) 和 \(EF\)

因为 \(A(-m,0)\)，\(B(n,0)\)，所以抛物线可写为

\[
y=a(x+m)(x-n).
\]

又 \(C(0,3m)\)，于是

\[
3m=a\cdot m\cdot(-n)=-amn.
\]

因为 \(m>0\)，所以

\[
a=-\frac3n.
\]

当 \(m=3,n=6\) 时，

\[
a=-\frac36=-\frac12.
\]

接下来直接使用 \(m=3\)。此时

\[
A(-3,0),\quad C(0,9).
\]

过 \(D\) 作 \(DG\perp OC\)，垂足为 \(G\)。因为 \(AC\) 绕点 \(C\) 逆时针旋转 \(90^\circ\) 得到 \(DC\)，所以

\[
AC=DC,\quad \angle ACD=90^\circ.
\]

又

\[
\angle AOC=\angle DGC=90^\circ,
\]

所以

\[
\angle ACO=\angle CDG.
\]

因此

\[
\triangle AOC\cong\triangle CDG.
\]

于是

\[
CG=AO=3,\quad DG=OC=9.
\]

所以

\[
G(0,6),\quad D(9,6).
\]

点 \(E\) 是 \(AD\) 中点，因此

\[
E\left(\frac{-3+9}{2},\frac{0+6}{2}\right)=(3,3).
\]

又 \(EF\parallel y\) 轴，所以 \(F\) 的横坐标为 \(3\)。当 \(n=6\) 时，

\[
y=-\frac12(x+3)(x-6).
\]

代入 \(x=3\)，得

\[
y_F=-\frac12\cdot 6\cdot(-3)=9.
\]

所以

\[
F(3,9),\quad E(3,3),\quad EF=9-3=6.
\]

# （II）② 由平行四边形和距离差最大值求解析式

由上一问构造全等直角三角形的思路可知

\[
D(3m,2m).
\]

又 \(A(-m,0)\)，且 \(E\) 是 \(AD\) 中点，所以

\[
E(m,m).
\]

因为 \(EF\parallel y\) 轴，所以 \(F\) 的横坐标为 \(m\)。

又 \(M\) 在 \(y\) 轴上，所以 \(M\) 的横坐标为 \(0\)。四边形 \(MFDB\) 为平行四边形，所以对角线中点相同：

\[
M+D=F+B.
\]

比较横坐标：

\[
0+3m=m+n\quad\Rightarrow\quad n=2m.
\]

因此

\[
a=-\frac3n=-\frac3{2m}.
\]

又根为 \(-m\) 与 \(2m\)，

\[
y=-\frac3{2m}(x+m)(x-2m).
\]

展开得

\[
y=-\frac3{2m}x^2+\frac32x+3m.
\]

对称轴为

\[
x=-\frac{b}{2a}=\frac m2.
\]

因为 \(F\) 的横坐标为 \(m\)，代入抛物线：

\[
y_F=-\frac3{2m}m^2+\frac32m+3m=3m.
\]

由纵坐标关系 \(y_M+2m=y_F\)，得

\[
M(0,m).
\]

设 \(P\) 在对称轴上：

\[
P\left(\frac m2,y\right).
\]

因为 \(A(-m,0)\)，\(B(2m,0)\) 关于对称轴 \(x=\frac m2\) 对称，所以

\[
PA=PB.
\]

于是

\[
PB-PM=PA-PM.
\]

在 \(\triangle APM\) 中，

\[
PA-PM\le AM.
\]

所以

\[
PB-PM\le AM.
\]

当 \(A,P,M\) 三点共线，且 \(P\) 在 \(A,M\) 所在直线上时，等号成立。此时最大值为

\[
AM=\sqrt{m^2+m^2}=m\sqrt2.
\]

题中给出最大值为 \(\frac{3\sqrt2}{4}\)，所以

\[
m\sqrt2=\frac{3\sqrt2}{4}\quad\Rightarrow\quad m=\frac34.
\]

此时

\[
a=-\frac3{2m}=-2,\quad b=\frac32,\quad c=3m=\frac94.
\]

所以抛物线解析式为

\[
y=-2x^2+\frac32x+\frac94.
\]

最大值取得时，\(P\) 是直线 \(AM\) 与对称轴的交点。因为直线 \(AM\) 为

\[
y=x+m,
\]

所以当 \(x=\frac m2\) 时，

\[
y=\frac32m.
\]

故

\[
P\left(\frac m2,\frac32m\right)=P\left(\frac38,\frac98\right).
\]
