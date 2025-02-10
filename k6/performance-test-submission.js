import http from "k6/http";
import { sleep } from "k6";

export const options = {
  duration: "10s",
  vus: 10,
  summaryTrendStats: ["med", "p(99)"],
};

export default function () {
  const url = "http://localhost:7800/api/grade";

  const payload = JSON.stringify({
    user: `test_user_${__VU}_${__ITER}`,
    assignment: 1,
    code: `Test code from k6: ${__VU}_${__ITER}`,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  http.post(url, payload, params);
}