'use client';
import {
    Box,
    Text,
    Input,
    Button,
    Container,
    Checkbox,
    ButtonGroup,
    List,
    ListItem,
    Flex
} from "@chakra-ui/react";
import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";

import { factorial, pow } from "@/utils";

export default function Home() {
    const [n, setN] = useState(2);
    const [y, setY] = useState(17);
    const [t, setT] = useState(6);

    const [queueCount, setQueueCount] = useState(null);
    const [endlessQueue, setEndlessQueue] = useState(true)

    const [result, setResult] = useState(null);

    const onCulculate = () => {
        let data = {};

        const formattedY = y / 60;

        data.u = 1 / t;
        data.p = formattedY * t;

        // p0
        let p0 = 1;

        for (let i = 1; i <= n; i++) {
            p0 = p0 + (pow(data.p, i) / i);
        }

        if (n > 1) {
            data.p0 = pow(p0, -1);
        } else {
            data.p0 = 1 - data.p;
        }


        // p1, p2, p3...
        data.p_array = [];

        // TODO: check
        data.p_array.push(data.p0);

        for (let i = 1; i <= n; i++) {
            if (n > 1) {
                let p = (
                    pow(data.p, i) / factorial(i)
                ) * data.p0;

                data.p_array.push(p);
            } else {
                let p = pow(data.p, i) * (1 - data.p);

                data.p_array.push(p);
            }
        }

        data.p_otk = 0;
        data.Q = 1 - data.p_otk;
        data.A = data.Q * formattedY;

        if (n > 1) {
            data.k = formattedY / data.u;
        } else {
            data.k = data.p;
        }

        // r0
        if (n > 1) {
            data.r0 = (
                pow(data.p, Number(n) + 1) * data.p0
            ) / (
                n * factorial(n) * pow(1 - (data.p / n), 2)
            )
        } else {
            data.r0 = pow(data.p, 2) / (1 - data.p);
        }

        // t0
        if (n > 1) {
            data.t0 = data.r0 / formattedY;
        } else {
            data.t0 = pow(data.p, 2) / (formattedY * (1 - data.p))
        }

        if (n == 1) {
            data.z_sist = data.r0 + data.p;
            data.t_sist = t + data.t0;
        }

        // for charts
        if (n > 1) {
            data.charts = {};
            data.charts.y = [formattedY.toFixed(2), 1, 2, 4, 10, 50, 200];
            data.charts.p = data.charts.y.map((item) => {
                return item * t;
            });

            data.charts.Q = data.charts.y.map(() => {
                return 1 - data.p_otk;
            });
            data.charts.A = data.charts.Q.map((item, index) => {
                return item * data.charts.y[index];
            })
            data.charts.K = data.charts.A.map((item) => {
                return item / data.u;
            });
        }

        setResult(data);
    }

    useEffect(() => {
        setResult(null);
    }, [n, y, t, queueCount, endlessQueue])

    return (
        <Container>
            <Box>
                <div>
                    <Text mb='8px'>Количество каналов</Text>
                    <Input
                        value={n}
                        onChange={(event) => setN(event.target.value)}
                        size='sm'
                    />
                </div>
                <div>
                    <Text mb='8px'>Интенсивность машин (в часах)</Text>
                    <Input
                        value={y}
                        onChange={(event) => setY(event.target.value)}
                        size='sm'
                    />
                </div>
                <div>
                    <Text mb='8px'>Время погрузки (в минутах)</Text>
                    <Input
                        value={t}
                        onChange={(event) => setT(event.target.value)}
                        size='sm'
                    />
                </div>
                <div>
                    <Checkbox
                        isChecked={endlessQueue}
                        disabled={true}
                        onChange={(e) => setEndlessQueue(e.target.checked)}
                    >
                        Бесконечная очередь
                    </Checkbox>
                    { !endlessQueue ? (
                        <div>
                            <Text mb='8px'>Максимальная длина очереди</Text>
                            <Input
                                value={queueCount}
                                onChange={(event) => setQueueCount(event.target.value)}
                                size='sm'
                            />
                        </div>
                    ) : null}
                </div>
                <ButtonGroup className={"mt-2"} gap={2}>
                    <Button
                        onClick={onCulculate}
                        disabled={!n || !t || !y}
                        className={"w-full"}
                    >
                        Расчитать
                    </Button>
                    <Button
                        onClick={() => setResult(null)}
                        disabled={!result}
                        className={"w-full"}
                    >
                        Очистить
                    </Button>
                </ButtonGroup>
            </Box>
            { result ? (
                <Box>
                    <Text>
                        Тип системы массового обслуживания:&nbsp;
                        { endlessQueue && n > 1 ? (
                            "Многоканальная СМО с неограниченной очередью"
                        ) : endlessQueue && n == 1 ? (
                            "Одноканальная СМО с неограниченной очередью"
                        ) : (
                            "Многоканальная СМО с ограниченным количеством мест в очереди"
                        )}
                    </Text>
                    <Text>
                        Интенсивность потока обслуживания: { result.u.toFixed(2) }
                    </Text>
                    <Text>
                        Коэффициент загрузки системы: { result.p }
                    </Text>
                    <Text>
                        Начальная вероятность: { result.p0.toFixed(2) }
                    </Text>
                    <Flex>
                        <Text>
                            Вероятности состояний:&nbsp;
                        </Text>
                        <List>
                            { result.p_array.map((item, index) => (
                                <ListItem
                                    key={index}
                                >
                                    p{ index }: { item.toFixed(2) }
                                </ListItem>
                            ))}
                        </List>
                    </Flex>
                    <Text>
                        Вероятность отказа: { result.p_otk } { result.p_otk === 0 ? "(Очередь не ограничена)" : "" }
                    </Text>
                    <Text>
                        Относительная пропускная способность: { result.Q }
                    </Text>
                    <Text>
                        Абсолютная пропускная способность: { result.A.toFixed(2) } ({ (result.A * 100).toFixed(2) }% в минуту)
                    </Text>
                    <Text>
                        Среднее число занятых каналов: { result.k }
                    </Text>
                    <Text>
                        Среднее число автомобилей в очереди: { result.r0.toFixed(2) }
                    </Text>
                    <Text>
                        Время ожидания обслуживания: { result.t0.toFixed(2) }
                    </Text>
                    { result.z_sist ? (
                        <Text>
                            Среднее число заявок в СМО: { result.z_sist }
                        </Text>
                    ) : null}
                    { result.t_sist ? (
                        <Text>
                            Среднее время пребывания заявки в СМО: { result.t_sist }
                        </Text>
                    ) : null}

                    { result.charts.y ? (
                        <Text className={"mt-5"}>
                            Различные значения λ для расчетов A и K: { result.charts.y.join(", ") }
                        </Text>
                    ) : null}
                    { result.charts ? (
                        <Line
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                    title: {
                                        display: true,
                                        text: 'Зависимость среднего числа занятых линий связи от интенсивности входного потока',
                                    },
                                },
                            }}
                            data={{
                                labels: result.charts.y,
                                datasets: [
                                    {
                                        data: result.charts.K,
                                        borderColor: 'rgb(255, 99, 132)',
                                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                    }
                                ]
                            }}
                        />
                    ) : null}
                    { result.charts ? (
                        <Line
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                    title: {
                                        display: true,
                                        text: 'Зависимость абсолютной пропускной способности от интенсивности входного потока',
                                    },
                                },
                            }}
                            data={{
                                labels: result.charts.y,
                                datasets: [
                                    {
                                        data: result.charts.A,
                                        borderColor: 'rgb(255, 99, 132)',
                                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                    }
                                ]
                            }}
                        />
                    ) : null}
                </Box>
            ) : null}
        </Container>
    )
}
