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

        data.p0 = pow(p0, -1);

        // p1, p2, p3...
        data.p_array = [];

        // TODO: check
        data.p_array.push(data.p0);

        for (let i = 1; i <= n; i++) {
            let p = (
                pow(data.p, i) / factorial(i)
            ) * data.p0;

            data.p_array.push(p);
        }

        data.p_otk = 0;
        data.Q = 1 - data.p_otk;
        data.A = data.Q * formattedY;
        data.k = formattedY / data.u;

        // r0
        data.r0 = (
            pow(data.p, Number(n) + 1) * data.p0
        ) / (
            n * factorial(n) * pow(1 - (data.p / n), 2)
        )

        // t0
        data.t0 = data.r0 / formattedY;

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
                        Интенсивность потока обслуживания: { result.u }
                    </Text>
                    <Text>
                        Коэффициент загрузки системы: { result.p }
                    </Text>
                    <Text>
                        Начальная вероятность: { result.p0 }
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
                                    p{ index }: { item }
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
                        Абсолютная пропускная способность: { result.A } ({ (result.A * 100).toFixed(2) }% в минуту)
                    </Text>
                    <Text>
                        Среднее число занятых каналов: { result.k }
                    </Text>
                    <Text>
                        Среднее число автомобилей в очереди: { result.r0 }
                    </Text>
                    <Text>
                        Время ожидания обслуживания: { result.t0 }
                    </Text>
                </Box>
            ) : null}
        </Container>
    )
}
