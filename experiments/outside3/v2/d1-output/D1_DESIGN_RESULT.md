# OUTSIDE-3 D1 synthetic-only design selection

**No calibration or registration. Raw and full ranking traces retained in workflow artifacts.**

Precommitted contribution floors: {"meanCRaw":1,"meanCM":0.5,"changedCRaw":0.1,"changedCM":0.1}.

| Reader | Window | C hits/200 | Raw hits/200 | C/Raw | Mean C–Raw displacement | Mean C–M displacement | Nonidentical C–Raw | Nonidentical C–M | Eligibility |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| ACTIVATION | 0 | 17 | 199 | 0.08542713567839195 | 20.09437500000001 | 0 | 0.9847159090909091 | 0 | DIAGNOSTIC_WINDOW_ZERO |
| PFM_STRAIN | 0 | 22 | 199 | 0.11055276381909548 | 19.70802556818182 | 20.434744318181814 | 1 | 0.9886363636363636 | DIAGNOSTIC_WINDOW_ZERO |
| ACTIVATION | 1 | 12 | 199 | 0.06030150753768844 | 20.665653409090915 | 5.702734375000001 | 1 | 0.987840909090909 | ELIGIBLE |
| PFM_STRAIN | 1 | 20 | 199 | 0.10050251256281408 | 20.147288707386355 | 18.114547230113633 | 1 | 0.9886363636363636 | ELIGIBLE |
| ACTIVATION | 3 | 15 | 199 | 0.07537688442211055 | 20.653551136363653 | 10.687936789772731 | 1 | 0.9886363636363636 | ELIGIBLE |
| PFM_STRAIN | 3 | 17 | 199 | 0.08542713567839195 | 20.212963423295463 | 21.57217507102272 | 1 | 0.9886363636363636 | ELIGIBLE |
| ACTIVATION | 10 | 8 | 199 | 0.04020100502512563 | 20.646537642045455 | 9.838508522727269 | 1 | 0.9886363636363636 | ELIGIBLE |
| PFM_STRAIN | 10 | 16 | 199 | 0.08040201005025126 | 20.307924360795457 | 17.47646661931817 | 1 | 0.9886363636363636 | ELIGIBLE |
| ACTIVATION | 30 | 14 | 199 | 0.07035175879396985 | 20.62591619318183 | 6.457846235795451 | 1 | 0.9886363636363636 | ELIGIBLE |
| PFM_STRAIN | 30 | 15 | 199 | 0.07537688442211055 | 20.422615411931815 | 18.637400568181825 | 1 | 0.9886363636363636 | ELIGIBLE |

Disposition: **D1_PROVISIONAL_DESIGN_NOMINEE**.
Provisional nominee: PFM_STRAIN_W1.
Window 0 is never eligible. Sensitivity is maximized only *subject to* both contribution floors.
K3 rewards preservation; P2 measures added value. Differences from Raw/M are not evidence of P2 improvement.
G frozen-rewire replay must pass before considering this a design-stage engineering nominee.
Fixed future K3 calibration gates are unchanged: Raw >=180, C >=50 and 2C>=Raw on fresh 200-series calibration data.
No frozen parameters, no hidden targets, registration closed.
